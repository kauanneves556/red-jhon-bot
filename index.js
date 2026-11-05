const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  REST,
  Routes,
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

// ================ CONFIGURAÇÕES ================

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

// ================ CLIENTE DISCORD ================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================ SERVIDOR WEB ================

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

const server = app.listen(
  process.env.PORT || 3000,
  "0.0.0.0",
  () => {
    console.log("Servidor HTTP iniciado!");
  }
);

server.on("error", (error) => {
  console.error("Erro no servidor HTTP:", error);
});

// ================ PAINEL /PAINEL ================
// Somente Dúvidas e Outros assuntos.
// Sem imagem e sem opção de compra.

function createPanelEmbed() {
  return new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle("🎫 SUPORTE | RED JHON OTIMIZAÇÕES")
    .setDescription(
      [
        "Bem-vindo à **Red Jhon Otimizações**!",
        "",
        "Selecione abaixo a opção que corresponde ao seu atendimento.",
        "",
        "━━━━━━━━━━━━━━━━━━━━",
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

// ================ PAINEL /PAINEL12 ================
// A imagem aparece exclusivamente neste painel.

const PURCHASE_IMAGE_URL =
  "https://cdn.discordapp.com/attachments/1567292471673618645/1567383080807825468/Gato_Neon_e_Marca_Red_Jhon.png";

// ================ PAGAMENTO PIX ================

const PIX_KEY = "63a9a136-7316-473e-a1e6-872143a3a13b";
const PIX_HOLDER = "Yago Antônio Dos Santos Monteiro";
const PIX_QR_IMAGE_URL =
  "https://media.discordapp.net/attachments/1567338899116658831/1567696171860754554/image.png?ex=6aed1e55&is=6aebccd5&hm=8f8470c53e45559feeb1d5163127e53d8505ad9eb862b45a4221f52f6d09122c&=&format=webp&quality=lossless&width=205&height=208";

function createPixEmbed() {
  return new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle("💠 PAGAMENTO VIA PIX")
    .setDescription(
      [
        "Faça o pagamento utilizando o QR Code ou a chave Pix abaixo.",
        "",
        `**Chave Pix:** \`${PIX_KEY}\``,
        `**Titular:** ${PIX_HOLDER}`,
        "",
        "📸 Após realizar o pagamento, envie uma foto do comprovante neste atendimento para nossa equipe conferir.",
        "",
        "💜 **Red Jhon Otimizações**"
      ].join("\n")
    )
    .setImage(PIX_QR_IMAGE_URL)
    .setFooter({ text: "Red Jhon Otimizações • Pagamento" })
    .setTimestamp();
}

function createPurchasePanelEmbed() {
  return new EmbedBuilder()
    .setColor(PURPLE)
    .setTitle("🛒 COMPRAR")
    .setDescription(
      [
        "🚀 **BEM-VINDO À RED JHON OTIMIZAÇÕES!**",
        "",
        "Quer melhorar o desempenho do seu PC e ter uma experiência mais fluida nos seus jogos? Você está no lugar certo!",
        "",
        "🖥️ Nossa equipe vai entender o que você precisa, tirar suas dúvidas e explicar as opções disponíveis para o seu computador.",
        "",
        "⚙️ Cada computador tem suas próprias características. Por isso, nosso atendimento serve para entender sua configuração e orientar você sobre as opções adequadas.",
        "",
        "📩 Para começar, clique no botão **Comprar** abaixo e abra seu atendimento privado com a nossa equipe.",
        "",
        "🔒 O atendimento é privado. Envie as informações necessárias por lá e aguarde nossa equipe responder.",
        "",
        "💜 **Red Jhon Otimizações — atendimento direto, atenção ao seu PC e orientação personalizada.**",
        "",
        "⚙️ **OTIMIZAÇÃO**",
        "",
        "<:02d394e8907c44b8b1b6ed61b98ce65:1567373285350707391> **R$ 35,00**",
        "",
        "📩 Abra um ticket para contratar sua otimização."
      ].join("\n")
    )
    .setImage(PURCHASE_IMAGE_URL)
    .setFooter({
      text: "Red Jhon Otimizações • Atendimento privado"
    })
    .setTimestamp();
}

function createPurchasePanelButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_comprar")
      .setLabel("Comprar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(EMOJIS.comprar)
  );
}

// ================ COMANDOS COM PREFIXO ================
// Use !painel e !painel12. Apenas administradores podem publicar os painéis.

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const command = message.content.trim().toLowerCase();
  if (command !== "!painel" && command !== "!painel12" && command !== "!pix") return;

  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
    await message.reply("❌ Apenas administradores podem usar esse comando.")
      .catch(console.error);
    return;
  }

  try {
    if (command === "!painel") {
      await message.channel.send({
        embeds: [createPanelEmbed()],
        components: [createPanelButtons()]
      });
      await message.reply("✅ Painel de suporte publicado!")
        .catch(console.error);
      return;
    }

    if (command === "!painel12") {
      await message.channel.send({
        embeds: [createPurchasePanelEmbed()],
        components: [createPurchasePanelButtons()]
      });
      await message.reply("✅ Painel de compra publicado!")
        .catch(console.error);
      return;
    }

    await message.channel.send({
      embeds: [createPixEmbed()]
    });
    await message.reply("✅ Dados do Pix enviados!")
      .catch(console.error);
  } catch (error) {
    console.error("Erro ao publicar painel:", error);
    await message.reply("❌ Não consegui publicar o painel. Verifica as permissões do bot.")
      .catch(() => {});
  }
});

// ================ INICIALIZAÇÃO ================
// Remove os comandos de barra antigos deste servidor para usar apenas os comandos com !.

client.once(Events.ClientReady, async (bot) => {
  console.log(`Red Jhon conectado como ${bot.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    console.log("Comandos de barra antigos removidos. Use !painel e !painel12.");
  } catch (error) {
    console.error("Erro ao remover comandos de barra antigos:", error);
  }
});

// ================ BOAS-VINDAS ================

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
      [
        `Salve, ${member}! Seja bem-vindo à **Red Jhon Otimizações**!`,
        "",
        "🚀 Aqui é o lugar certo para quem busca mais desempenho, mais FPS e menos travamentos!",
        "",
        "<:1563238014401118361:1567331646871699516> Conheça nossos serviços de otimização de PC, configurações personalizadas, suporte e muito mais.",
        "",
        "📩 Precisa de ajuda ou quer melhorar seu PC? Abra um ticket e fale com nossa equipe.",
        "",
        "🔥 Sinta-se à vontade, explore o servidor e faça parte da nossa comunidade!",
        "",
        "**RED JHON OTIMIZAÇÕES**",
        "Mais desempenho. Menos travamentos. Mais gameplay."
      ].join("\n")
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({
      text: "Red Jhon Otimizações"
    })
    .setTimestamp();

  await channel.send({
    embeds: [embed]
  }).catch(console.error);
});

// ================ PERMISSÕES ================

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

// ================ TRANSCRIPT ================

async function createTranscript(channel) {
  const messages = [];
  let before;

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

    const attachments = [...message.attachments.values()]
      .map((file) => `Anexo: ${file.url}`)
      .join("\n");

    return [
      `[${time}] ${message.author.tag} (${message.author.id})`,
      message.content || "[Mensagem sem texto]",
      attachments,
      message.embeds.length
        ? `[${message.embeds.length} embed(s)]`
        : ""
    ]
      .filter(Boolean)
      .join("\n");
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

// ================ INTERAÇÕES ================

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // COMANDO /PAINEL

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === "painel"
    ) {
      await interaction.reply({
        content: "Painel de suporte publicado!",
        ephemeral: true
      });

      await interaction.channel.send({
        embeds: [createPanelEmbed()],
        components: [createPanelButtons()]
      });

      return;
    }

    // COMANDO /PAINEL12

    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === "painel12"
    ) {
      await interaction.reply({
        content: "Painel de compra publicado!",
        ephemeral: true
      });

      await interaction.channel.send({
        embeds: [createPurchasePanelEmbed()],
        components: [createPurchasePanelButtons()]
      });

      return;
    }

    // BOTÃO RENOMEAR

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
        .setPlaceholder("Ex.: compra-cliente")
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(90)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome)
      );

      return interaction.showModal(modal);
    }

    // FORMULÁRIO DE RENOMEAÇÃO

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

      await interaction.deferReply({
        ephemeral: true
      });

      try {
        await channel.setName(
          novoNome,
          `Renomeado por ${interaction.user.tag}`
        );

        return interaction.editReply(
          `✅ Canal renomeado para **#${novoNome}**.`
        );
      } catch (error) {
        console.error("Erro ao renomear:", error);

        return interaction.editReply(
          "Não consegui renomear. Verifica se o bot tem Gerenciar Canais."
        );
      }
    }

    if (!interaction.isButton()) return;

    // RESOLVER TICKET E ENVIAR TRANSCRIPT

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

      await interaction.deferReply({
        ephemeral: true
      });

      const logChannel = await client.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (!logChannel?.isTextBased() || !logChannel.send) {
        return interaction.editReply(
          "Canal de logs não encontrado. Verifica o ID e as permissões."
        );
      }

      try {
        const ownerId = channel.topic.slice("ticket:".length);

        const {
          messages,
          buffer
        } = await createTranscript(channel);

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
          "✅ Ticket resolvido! Transcript enviado aos logs. Canal será excluído em 5 segundos."
        );

        setTimeout(() => {
          channel.delete("Ticket resolvido pela equipe")
            .catch(console.error);
        }, 5000);
      } catch (error) {
        console.error("Erro ao resolver ticket:", error);

        await interaction.editReply(
          "Não consegui concluir o fechamento. Verifica os logs do Render."
        );
      }

      return;
    }

    // CRIAR TICKET PELOS DOIS PAINÉIS

    if (
      interaction.customId === "ticket_comprar" ||
      interaction.customId === "ticket_duvida" ||
      interaction.customId === "ticket_outros"
    ) {
      await interaction.deferReply({
        ephemeral: true
      });

      const categoryKey = interaction.customId.slice("ticket_".length);
      const category = CATEGORIES[categoryKey];
      const guild = interaction.guild;

      if (!category || !guild) {
        return interaction.editReply("Categoria inválida.");
      }

      // Impede mais de um ticket aberto por usuário.

      const channels = await guild.channels.fetch();

      const existing = channels.find(
        (channel) =>
          channel?.type === ChannelType.GuildText &&
          channel.topic === `ticket:${interaction.user.id}`
      );

      if (existing) {
        return interaction.editReply(
          `Tu já tem um ticket aberto: ${existing}`
        );
      }

      // PERMISSÕES DO TICKET

      const overwrites = [
        {
          id: guild.roles.everyone.id,
          deny: [
            PermissionFlagsBits.ViewChannel
          ]
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

      // Os mesmos três cargos autorizados.

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

      // EMBED DENTRO DO TICKET

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

      // BOTÕES DO TICKET

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
  } catch (error) {
    console.error("Erro na interação:", error);

    if (interaction.deferred) {
      await interaction.editReply(
        "Ocorreu um erro. Confere os logs do bot no Render."
      ).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({
        content: "Ocorreu um erro. Confere os logs do bot no Render.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ================ ESTABILIDADE E RECONEXÃO ================

client.on("error", (error) => {
  console.error("Erro do Discord:", error);
});

// O discord.js tenta reconectar automaticamente quando a conexão
// com o Gateway é interrompida.

client.on(Events.ShardDisconnect, (event, shardId) => {
  console.warn(
    `Shard ${shardId} desconectado. Código: ${event?.code ?? "desconhecido"}.`
  );
});

client.on(Events.ShardReconnecting, (shardId) => {
  console.warn(`Reconectando shard ${shardId}...`);
});

client.on(Events.ShardResume, (shardId, replayedEvents) => {
  console.log(
    `Shard ${shardId} reconectado. Eventos recuperados: ${replayedEvents}.`
  );
});

client.on(Events.ShardError, (error, shardId) => {
  console.error(`Erro no shard ${shardId}:`, error);
});

// Registra falhas assíncronas para facilitar o diagnóstico.

process.on("unhandledRejection", (reason) => {
  console.error("Promise rejeitada sem tratamento:", reason);
});

// Uma exceção não capturada pode deixar o processo em estado inseguro.
// Encerra o processo para que a plataforma possa reiniciar o serviço.

process.on("uncaughtException", (error) => {
  console.error(
    "Exceção não capturada; encerrando para reinicialização:",
    error
  );

  process.exit(1);
});

// Encerramento organizado quando a plataforma parar ou reiniciar o serviço.

function gracefulShutdown(signal) {
  console.log(`${signal} recebido. Encerrando o bot...`);

  client.destroy();

  server.close(() => {
    console.log("Servidor HTTP encerrado.");
    process.exit(0);
  });

  // Evita ficar preso no encerramento se houver conexões pendentes.
  setTimeout(() => {
    process.exit(0);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ================ LOGIN ================

client.login(TOKEN).catch((error) => {
  console.error("Falha ao conectar ao Discord:", error);
  process.exit(1);
});
