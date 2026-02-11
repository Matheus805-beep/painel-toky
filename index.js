const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`✅ ORG TK online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {

    // ===== COMANDO /painel =====
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "painel") {

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Sistema Oficial" })
          .setTitle("🎮 Painel de Partidas")
          .setDescription(
            "Bem-vindo ao sistema da **ORG TK**.\n\n" +
            "1️⃣ Escolha o modo\n" +
            "2️⃣ Escolha o valor\n" +
            "3️⃣ Entre na fila\n\n" +
            "⚡ Sistema automático."
          )
          .setColor("#0099ff")
          .setFooter({ text: "ORG TK © 2026" });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("modo_1v1").setLabel("🔥 1v1").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_2v2").setLabel("⚔ 2v2").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_3v3").setLabel("💥 3v3").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_4v4").setLabel("👑 4v4").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
          embeds: [embed],
          components: [row]
        });
      }
    }

    // ===== BOTÕES =====
    if (interaction.isButton()) {

      // ESCOLHER MODO
      if (interaction.customId.startsWith("modo_")) {

        const modo = interaction.customId.replace("modo_", "");

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Seleção de Valor" })
          .setTitle(`💰 Modo ${modo.toUpperCase()}`)
          .setDescription("Escolha o valor da partida abaixo:")
          .setColor("#00c3ff");

        const valores = [1, 5, 10, 20, 50, 100];
        const row = new ActionRowBuilder();

        valores.forEach(valor => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`valor_${modo}_${valor}`)
              .setLabel(`💲 ${valor}`)
              .setStyle(ButtonStyle.Secondary)
          );
        });

        await interaction.update({
          embeds: [embed],
          components: [row]
        });
      }

      // ESCOLHER VALOR
      else if (interaction.customId.startsWith("valor_")) {

        const partes = interaction.customId.split("_");
        const modo = partes[1];
        const valor = partes[2];

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Fila Criada" })
          .setTitle("🎮 Partida Configurada")
          .setDescription(
            `🏆 Modo: ${modo.toUpperCase()}\n` +
            `💰 Valor: ${valor}\n\n` +
            "Clique abaixo para entrar na fila."
          )
          .setColor("#007bff");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`entrar_${modo}_${valor}`)
            .setLabel("✅ Entrar na Fila")
            .setStyle(ButtonStyle.Success)
        );

        await interaction.update({
          embeds: [embed],
          components: [row]
        });
      }

      // ENTRAR
      else if (interaction.customId.startsWith("entrar_")) {

        await interaction.reply({
          content: "✅ Você entrou na fila com sucesso!",
          ephemeral: true
        });
      }
    }

  } catch (error) {
    console.error("ERRO DETECTADO:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Ocorreu um erro interno.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);