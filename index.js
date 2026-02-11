const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const filas = {};

client.once("ready", () => {
  console.log(`✅ ORG TK online como ${client.user.tag}`);
});

function criarEmbedFila(fila) {
  return new EmbedBuilder()
    .setAuthor({ name: "ORG TK • Sistema Oficial" })
    .setTitle("🎮 Fila Ativa")
    .setDescription(
      `🏆 **Modo:** ${fila.modo.toUpperCase()}\n` +
      `💰 **Valor:** ${fila.valor}\n\n` +
      `👥 **Jogadores (${fila.jogadores.length}/${fila.max}):**\n` +
      (fila.jogadores.length > 0
        ? fila.jogadores.map(id => `<@${id}>`).join("\n")
        : "Ninguém entrou ainda.")
    )
    .setColor("#0099ff")
    .setFooter({ text: "ORG TK © Sistema Automático" });
}

client.on("interactionCreate", async (interaction) => {
  try {

    // ===== COMANDO /painel =====
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "painel") {

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Sistema Oficial" })
          .setTitle("🎮 Painel de Partidas")
          .setDescription(
            "Bem-vindo ao sistema de filas da **ORG TK**.\n\n" +
            "1️⃣ Escolha o modo\n" +
            "2️⃣ Escolha o valor\n" +
            "3️⃣ Entre na fila\n\n" +
            "⚡ A partida inicia automaticamente."
          )
          .setColor("#0099ff")
          .setFooter({ text: "ORG TK © 2026" });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("modo_1v1").setLabel("🔥 1v1").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_2v2").setLabel("⚔ 2v2").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_3v3").setLabel("💥 3v3").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("modo_4v4").setLabel("👑 4v4").setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
      }
    }

    if (interaction.isButton()) {

      // ===== ESCOLHER MODO =====
      if (interaction.customId.startsWith("modo_")) {

        const modo = interaction.customId.replace("modo_", "");

        const embed = new EmbedBuilder()
          .setAuthor({ name: "ORG TK • Seleção de Valor" })
          .setTitle(`💰 Modo ${modo.toUpperCase()}`)
          .setDescription("Escolha o valor da partida abaixo:")
          .setColor("#00c3ff");

        const valores = [1, 5, 10, 20, 50, 100];

        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        valores.forEach((valor, index) => {
          const botao = new ButtonBuilder()
            .setCustomId(`valor_${modo}_${valor}`)
            .setLabel(`💲 ${valor}`)
            .setStyle(ButtonStyle.Secondary);

          if (index < 5) row1.addComponents(botao);
          else row2.addComponents(botao);
        });

        await interaction.update({
          embeds: [embed],
          components: [row1, row2]
        });
      }

      // ===== CRIAR FILA =====
      else if (interaction.customId.startsWith("valor_")) {

        const partes = interaction.customId.split("_");
        const modo = partes[1];
        const valor = partes[2];
        const maxJogadores = parseInt(modo[0]) * 2;

        const filaId = `${modo}_${valor}`;

        filas[filaId] = {
          modo,
          valor,
          jogadores: [],
          max: maxJogadores
        };

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`entrar_${filaId}`)
            .setLabel("✅ Entrar")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`sair_${filaId}`)
            .setLabel("❌ Sair")
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.update({
          embeds: [criarEmbedFila(filas[filaId])],
          components: [row]
        });
      }

      // ===== ENTRAR =====
      else if (interaction.customId.startsWith("entrar_")) {

        const filaId = interaction.customId.replace("entrar_", "");
        const fila = filas[filaId];

        if (!fila.jogadores.includes(interaction.user.id)) {
          fila.jogadores.push(interaction.user.id);
        }

        await interaction.update({
          embeds: [criarEmbedFila(fila)],
          components: interaction.message.components
        });

        if (fila.jogadores.length >= fila.max) {

          const canal = await interaction.guild.channels.create({
            name: `partida-${fila.modo}-${fila.valor}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
              },
              ...fila.jogadores.map(id => ({
                id: id,
                allow: [PermissionsBitField.Flags.ViewChannel]
              }))
            ]
          });

          await canal.send(
            `🔥 Partida iniciada!\n\n` +
            fila.jogadores.map(id => `<@${id}>`).join("\n")
          );

          delete filas[filaId];
        }
      }

      // ===== SAIR =====
      else if (interaction.customId.startsWith("sair_")) {

        const filaId = interaction.customId.replace("sair_", "");
        const fila = filas[filaId];

        fila.jogadores = fila.jogadores.filter(id => id !== interaction.user.id);

        await interaction.update({
          embeds: [criarEmbedFila(fila)],
          components: interaction.message.components
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