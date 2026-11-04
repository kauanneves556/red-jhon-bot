
const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const express = require("express");

// ================= CONFIGURAÇÕES =================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

const LOG_CHANNEL_ID = "1567370194534273134";

const STAFF_ROLE_IDS = [
  "1559321362231861288",
  "1559321364513558652",
  "1559321363402068008"
];

const PURPLE = 0x9B59B6;

const EMOJIS = {
  comprar: {
    id: "1567373285350707391",
    name: "02d394e8907c44b8b1b6ed61b98ce655"
  },
  duvida: {
    id: "1567331816141103205",
    name: "1565136811947331705"
  },
  outros: {
    id: "1567331692761583746",
    name: "1563238140821635112"
  }
};

const CATEGORIES = {
  comprar: {
    label: "Comprar otimização",
    description: "Quero contratar uma otimização para o meu PC.",
    channelPrefix: "compra"
  },
  duvida: {
    label: "Dúvidas",
    description: "Tenho dúvidas sobre os serviços e otimizações.",
    channelPrefix: "duvida"
  },
  outros: {
    label: "Outros assuntos",
    description: "Preciso de ajuda com outro assunto.",
    channelPrefix: "outros"
  }
};

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error(
    "Configure DISCORD_TOKEN, CLIENT_ID e GUILD_ID no Render."
  );
}

// ================= CLIENTE =================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= SERVIDOR WEB RENDER =================

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Red Jhon Bot está online!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    bot: client.isReady() ? "online" : "connecting"
  });
});

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Servidor HTTP iniciado!");
});

// ================= PAINEL ORIGINAL =================
// Não alterar o visual do painel.

function createPanelEmbed() {
  return new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle("🎫 SUPORTE | RED JHON OTIMIZAÇÕES")
    .setDescription(
      [
        "Bem-vindo ao atendimento da **Red Jhon Otimizações**!",
        "",
        "Selecione abaixo a opção que corresponde ao seu atendimento.",
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        "🛒 **COMPRAR OTIMIZAÇÃO**",
        "Deseja contratar um serviço para o seu PC?",
        "",
        "❓ **DÚVIDAS**",
        "Tem perguntas sobre nossos serviços?",
        "",
        "💬 **OUTROS ASSUNTOS**",
        "Precisa de ajuda com outra questão?",
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "",
        "🔒 Seus tickets são privados.",
        "Nossa equipe responderá assim que possível."
      ].join("\n")
    )
    .setFooter({
      text: "Red Jhon Otimizações • Central de Atendimento"
    })
    .setTimestamp();
}

function createPanelButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_comprar")
      .setLabel("Comprar otimização")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(EMOJIS.comprar),

    new ButtonBuilder()
      .setCustomId("ticket_duvida")
      .setLabel("Dúvidas")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(EMOJIS.duvida),

    new ButtonBuilder()
      .setCustomId("ticket_outros")
      .setLabel("Outros assuntos")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(EMOJIS.outros)
  );
}

// ================= COMANDO =================

const commands = [
  new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Publica o painel de atendimento da Red Jhon.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
];

// ================= INICIALIZAÇÃO =================

client.once(Events.ClientReady, async (bot) => {
  console.log(`Red Jhon conectado como ${bot.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Comando /painel registrado!");
  } catch (error) {
    console.error("Erro ao registrar comandos:", error);
  }
});

// ================= BOAS-VINDAS =================

client.on(Events.GuildMemberAdd, async (member) => {
  if (!WELCOME_CHANNEL_ID) return;

  const channel = await member.guild.channels
    .fetch(WELCOME_CHANNEL_ID)
    .catch(() => null);

  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle("Bem-vindo à Red Jhon!")
    .setDescription(
      `Salve, ${member}! Seja bem-vindo à **Red Jhon Otimizações**!`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "Red Jhon Otimizações" })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(console.error);
});

// ================= PERMISSÕES =================

function isAuthorized(member) {
  return STAFF_ROLE_IDS.some((roleId) =>
    member?.roles?.cache?.has(roleId)
  );
}

function isTicket(channel) {
  return (
    channel?.type === ChannelType.GuildText &&
    typeof channel.topic === "string" &&
    channel.topic.startsWith("ticket:")
  );
}

// ================= TRANSCRIPT =================

async function createTranscript(channel) {
  const messages = [];
  let before;

  // Lê até 5.000 mensagens em lotes de 100.
  for (let page = 0; page < 50; page++) {
    const batch = await channel.messages.fetch({
      limit: 100,
      ...(before ? { before } : {})
    });

    if (batch.size === 0) break;

    messages.push(...batch.values());
    before = batch.last().id;

    if (batch.size < 100) break;
  }

  messages.reverse();

  const lines = messages.map((message) => {
    const time = message.createdAt.toLocaleString("pt-BR", {
      timeZone: "America/Bahia"
    });

    const content = message.content || "[Mensagem sem texto]";

    const attachments = [...message.attachments.values()]
      .map((file) => `Anexo: ${file.url}`)
      .join("\n");

    const embeds = message.embeds.length
      ? `[${message.embeds.length} embed(s)]`
      : "";

    return [
      `[${time}] ${message.author.tag} (${message.author.id})`,
      content,
      attachments,
      embeds
    ].filter(Boolean).join("\n");
  });

  const transcript = [
    "TRANSCRIPT - RED JHON OTIMIZAÇÕES",
    `Canal: ${channel.name}`,
    `ID do canal: ${channel.id}`,
    `Mensagens: ${messages.length}`,
    "=".repeat(50),
    "",
    lines.join("\n\n")
  ].join("\n");

  return {
    messages,
    buffer: Buffer.from(transcript, "utf8")
  };
}

// ================= INTERAÇÕES =================

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // ---------- COMANDO /PAINEL ----------

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === "painel"
    ) {
      await interaction.reply({
        content: "Painel publicado!",
        ephemeral: true
      });

      await interaction.channel.send({
        embeds: [createPanelEmbed()],
        components: [createPanelButtons()]
      });

      return;
    }

    // ---------- ABRIR FORMULÁRIO DE RENOMEAÇÃO ----------
    // Deve ficar antes da lógica de criação de tickets.

    if (
      interaction.isButton() &&
      interaction.customId === "renomear_ticket"
    ) {
      if (!isAuthorized(interaction.member)) {
        return interaction.reply({
          content: "Somente a equipe autorizada pode renomear tickets.",
          ephemeral: true
        });
      }

      if (!isTicket(interaction.channel)) {
        return interaction.reply({
          content: "Este canal não é um ticket válido.",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("modal_renomear_ticket")
        .setTitle("Renomear ticket");

      const nome = new TextInputBuilder()
        .setCustomId("novo_nome")
        .setLabel("Novo nome do canal")
        .setPlaceholder("Ex.: compra-kauan")
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(90)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome)
      );

      return interaction.showModal(modal);
    }

    // ---------- RECEBER O FORMULÁRIO ----------

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "modal_renomear_ticket"
    ) {
      if (!isAuthorized(interaction.member)) {
        return interaction.reply({
          content: "Somente a equipe autorizada pode renomear tickets.",
          ephemeral: true
        });
      }

      const channel = interaction.channel;

      if (!isTicket(channel)) {
        return interaction.reply({
          content: "Este canal não é um ticket válido.",
          ephemeral: true
        });
      }

      const novoNome = interaction.fields
        .getTextInputValue("novo_nome")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 90);

      if (!novoNome) {
        return interaction.reply({
          content: "Digite um nome válido.",
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      try {
        await channel.setName(
          novoNome,
          `Ticket renomeado por ${interaction.user.tag}`
        );

        return interaction.editReply(
          `✅ Canal renomeado para **#${novoNome}**.`
        );
      } catch (error) {
        console.error("Erro ao renomear canal:", error);

        return interaction.editReply(
          "Não consegui renomear. Confere se o bot tem a permissão Gerenciar Canais."
        );
      }
    }

    if (!interaction.isButton()) return;

    // ---------- CRIAR TICKET ----------

    if (interaction.customId.startsWith("ticket_")) {
      await interaction.deferReply({ ephemeral: true });

      const categoryKey = interaction.customId.slice("ticket_".length);
      const category = CATEGORIES[categoryKey];

      if (!category) {
        return interaction.editReply("Categoria inválida.");
      }

      const guild = interaction.guild;

      if (!guild) {
        return interaction.editReply(
          "Este botão só funciona dentro do servidor."
        );
      }

      const existingChannels = await guild.channels.fetch();

      const existing = existingChannels.find(
        (channel) =>
          channel?.type === ChannelType.GuildText &&
          channel.topic === `ticket:${interaction.user.id}`
      );

      if (existing) {
        return interaction.editReply(
          `Tu já tem um ticket aberto: ${existing}`
        );
      }

      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.AttachFiles
          ]
        }
      ];

      for (const roleId of STAFF_ROLE_IDS) {
        overwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        });
      }

      const username = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 70) || "usuario";

      const channel = await guild.channels.create({
        name: `${category.channelPrefix}-${username}`.slice(0, 100),
        type: ChannelType.GuildText,
        topic: `ticket:${interaction.user.id}`,
        permissionOverwrites: overwrites
      });

      const embed = new EmbedBuilder()
        .setColor(PURPLE)
        .setTitle(category.label)
        .setDescription(
          [
            `Olá, ${interaction.user}!`,
            "",
            category.description,
            "",
            "Explique seu pedido nesta conversa.",
            "A equipe da Red Jhon vai te atender assim que possível."
          ].join("\n")
        )
        .addFields(
          {
            name: "Cliente",
            value: `${interaction.user}`,
            inline: true
          },
          {
            name: "Atendimento",
            value: category.label,
            inline: true
          }
        )
        .setFooter({
          text: "Red Jhon Otimizações • Atendimento privado"
        })
        .setTimestamp();

      // Resolvido primeiro; renomear segundo.
      const ticketButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_resolvido")
          .setLabel("Resolvido")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("renomear_ticket")
          .setLabel("Renomear ticket")
          .setEmoji("✏️")
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [ticketButtons],
        allowedMentions: {
          users: [interaction.user.id]
        }
      });

      return interaction.editReply(
        `Teu ticket foi criado: ${channel}`
      );
    }

    // ---------- RESOLVER E FECHAR TICKET ----------

    if (interaction.customId === "ticket_resolvido") {
      if (!isAuthorized(interaction.member)) {
        return interaction.reply({
          content: "Somente os cargos autorizados podem resolver tickets.",
          ephemeral: true
        });
      }

      const channel = interaction.channel;

      if (!isTicket(channel)) {
        return interaction.reply({
          content: "Este canal não é um ticket válido.",
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      const logChannel = await client.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (!logChannel?.isTextBased() || !logChannel.send) {
        return interaction.editReply(
          "Não encontrei o canal de logs. Confere o ID e as permissões do bot."
        );
      }

      const ownerId = channel.topic.slice("ticket:".length);

      const { messages, buffer } = await createTranscript(channel);

      const attachment = new AttachmentBuilder(buffer, {
        name: `transcript-${channel.name}.txt`
      });

      const summary = new EmbedBuilder()
        .setColor(PURPLE)
        .setTitle("📁 Ticket resolvido")
        .setDescription(
          [
            `**Canal:** #${channel.name}`,
            `**Cliente:** <@${ownerId}>`,
            `**Resolvido por:** ${interaction.user}`,
            `**Mensagens registradas:** ${messages.length}`,
            "",
            "O transcript completo está anexado para download."
          ].join("\n")
        )
        .setFooter({
          text: "Red Jhon Otimizações • Logs de atendimento"
        })
        .setTimestamp();

      await logChannel.send({
        embeds: [summary],
        files: [attachment]
      });

      await interaction.editReply(
        "✅ Ticket resolvido! Transcript enviado aos logs. O canal será excluído em 5 segundos."
      );

      setTimeout(async () => {
        await channel.delete("Ticket resolvido pela equipe")
          .catch(console.error);
      }, 5000);
    }
  } catch (error) {
    console.error("Erro na interação:", error);

    if (interaction.deferred) {
      await interaction.editReply(
        "Ocorreu um erro. Confere os logs do bot."
      ).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({
        content: "Ocorreu um erro. Confere os logs do bot.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

client.on("error", (error) => {
  console.error("Erro do Discord:", error);
});

client.login(TOKEN).catch((error) => {
  console.error("Falha ao conectar ao Discord:", error);
  process.exitCode = 1;
});
