
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
  ButtonStyle
} = require("discord.js");

const express = require("express");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  throw new Error(
    "Configure DISCORD_TOKEN, CLIENT_ID e GUILD_ID no Render."
  );
}

// Servidor HTTP para o Render Web Service
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor HTTP iniciado na porta ${PORT}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Publica o painel de suporte")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .toJSON()
];

client.once(Events.ClientReady, async (bot) => {
  console.log(`Red Jhon conectado como ${bot.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Comandos registrados!");
  } catch (error) {
    console.error("Erro ao registrar comandos:", error);
  }
});

// Boas-vindas
client.on(Events.GuildMemberAdd, async (member) => {
  if (!WELCOME_CHANNEL_ID) return;

  const channel = member.guild.channels.cache.get(
    WELCOME_CHANNEL_ID
  );

  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(0xE50914)
    .setTitle("🔴 Bem-vindo à Red Jhon!")
    .setDescription(
      `Salve, ${member}! Seja bem-vindo à **Red Jhon Otimizações**!`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "Red Jhon Otimizações" })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(console.error);
});

// Comandos e botões
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (
      interaction.isChatInputCommand() &&
      interaction.commandName === "painel"
    ) {
      const embed = new EmbedBuilder()
        .setColor(0xE50914)
        .setTitle("🎫 Suporte | Red Jhon")
        .setDescription(
          "Precisa de ajuda? Clique no botão abaixo para abrir um ticket."
        )
        .setFooter({ text: "Red Jhon Otimizações" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_ticket")
          .setLabel("Abrir ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }

    if (
      interaction.isButton() &&
      interaction.customId === "abrir_ticket"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;

      if (!guild) {
        return interaction.editReply(
          "Este botão só funciona dentro de um servidor."
        );
      }

      const existing = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          channel.topic === `ticket:${interaction.user.id}`
      );

      if (existing) {
        return interaction.editReply(
          `Tu já tem um ticket aberto: ${existing}`
        );
      }

      const username = interaction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 80) || "usuario";

      const channel = await guild.channels.create({
        name: `ticket-${username}`.slice(0, 100),
        type: ChannelType.GuildText,
        topic: `ticket:${interaction.user.id}`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageChannels
            ]
          }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor(0xE50914)
        .setTitle("🎫 Ticket aberto")
        .setDescription(
          `Olá, ${interaction.user}! Explica aqui o que precisas. A equipe vai te atender.`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fechar_ticket")
          .setLabel("Fechar ticket")
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      return interaction.editReply(`Ticket criado: ${channel}`);
    }

    if (
      interaction.isButton() &&
      interaction.customId === "fechar_ticket"
    ) {
      const channel = interaction.channel;
      const topic = channel?.topic || "";

      const ownerId = topic.startsWith("ticket:")
        ? topic.slice("ticket:".length)
        : null;

      if (!ownerId) {
        return interaction.reply({
          content: "Este canal não parece ser um ticket válido.",
          ephemeral: true
        });
      }

      if (
        interaction.user.id !== ownerId &&
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {
        return interaction.reply({
          content: "Só o dono do ticket ou a equipe autorizada pode fechá-lo.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content: "Ticket será fechado em 5 segundos.",
        ephemeral: true
      });

      setTimeout(() => {
        channel.delete().catch(console.error);
      }, 5000);
    }
  } catch (error) {
    console.error("Erro ao processar interação:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Ocorreu um erro. Tenta novamente.",
        ephemeral: true
      }).catch(console.error);
    } else if (interaction.deferred) {
      await interaction.editReply(
        "Ocorreu um erro. Tenta novamente."
      ).catch(console.error);
    }
  }
});

client.on("error", (error) => {
  console.error("Erro no cliente Discord:", error);
});

client.login(TOKEN).catch((error) => {
  console.error("Falha ao conectar ao Discord:", error);
  process.exitCode = 1;
});
