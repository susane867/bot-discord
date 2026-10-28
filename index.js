const { 
    Client, 
    GatewayIntentBits, 
    PermissionFlagsBits, 
    REST, 
    Routes, 
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder,
    ChannelSelectMenuBuilder,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags // <--- Ajouté ici
} = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const http = require('http');
const { createCanvas } = require('@napi-rs/canvas');
const { loadImage } = require('@napi-rs/canvas');
const path = require('path');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN est manquant. Définis-le dans le fichier .env ou dans les variables d’environnement.');
}
const CLIENT_ID = '1535340152363163678';
const CONFIG_FILE = './config.json';
const ROBLOX_LINKS_FILE = './robloxLinks.json';

const ROLES = {
    WARN_1: '1474788176093646858',
    WARN_2: '1474788273321807903',
    WARN_3: '1474788379353677934'
};

const ALL_QUESTS_CONFIG = {
    1: { title: "Premiers pas dans la famille", type: "messages", goal: 10, description: "Envoie 10 messages et présente-toi.", reward: "Rôle \"Nouveau de la Famille\" + 100 XP" },
    2: { title: "Première voix", type: "voice", goal: 15, description: "Passe 15 minutes en vocal. Compte uniquement le temps réel passé dans un salon vocal.", reward: "100 IG + 150 XP" },
    3: { title: "Discussion active", type: "messages", goal: 30, description: "Envoie 30 messages sur le serveur.", reward: "200 IG + 200 XP" },
    4: { title: "Élève Assidu", type: "manual", goal: 1, description: "[SchoolRP] Va à l'école, prends un screen dans la cour avec un membre.", reward: "Rôle \"Élève Assidu\" + 350 IG + 250 XP" },
    5: { title: "Session vocale", type: "voice", goal: 30, description: "Participe à une session vocale de 30 minutes. Le temps compte seulement si tu es réellement en vocal.", reward: "300 IG + 300 XP" },
    6: { title: "Cap des 50 messages", type: "messages", goal: 50, description: "Envoie 50 messages au total.", reward: "400 IG + 400 XP" },
    7: { title: "Immersion School RP", type: "manual", goal: 1, description: "[SchoolRP] Passe 30 minutes connectées sur School RP.", reward: "500 IG + 500 XP" },
    8: { title: "Parrainage", type: "invite", goal: 2, description: "Invite 2 amis sur le Discord de la famille.", reward: "400 IG + 400 XP" },
    9: { title: "Reaction", type: "reaction", goal: 20, description: "Réagis avec des émojis sur 20 messages (il n'y a que les nouveaux messages pris en compte).", reward: "Rôle \"Serpentin\" + 400 XP" },
    10: { title: "VIP", type: "hybrid", goal: 100, description: "Cumule 100 messages et 1h de vocal. Le temps vocal compte uniquement si tu es réellement en vocal.", reward: "VIP Classique (1 sem.) + 1 000 XP" },

    11: { title: "Rythme de croisière", type: "messages", goal: 75, description: "Envoie 75 messages.", reward: "500 IG + 1 100 XP" },
    12: { title: "L'Heure de classe", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen assis à ta table de classe pendant un cours.", reward: "1 200 XP" },
    13: { title: "Soirée chill", type: "voice", goal: 45, description: "Passe 45 minutes en vocal un soir de semaine. Compte uniquement le temps réel passé en vocal.", reward: "Rôle \"Zouave\" + 500 XP" },
    14: { title: "Piplette", type: "messages", goal: 150, description: "Envoie 150 messages.", reward: "Rôle \"Tchateur\" + 200 IG" },
    15: { title: "Première heure RP", type: "manual", goal: 1, description: "[SchoolRP] Passe 1 heure en jeu sur School RP.", reward: "1 000 IG + Rôle \"Élève exemplaire\" + 1 500 XP" },
    16: { title: "Cap des 120 messages", type: "messages", goal: 160, description: "Envoie 160 messages.", reward: "200 IG + 1 000 XP" },
    17: { title: "Habitué du vocal", type: "voice", goal: 90, description: "Passe 1h30 en vocal cumulée. Le temps compte uniquement quand tu es vraiment en vocal.", reward: "1 700 XP" },
    18: { title: "Devant le bahut", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen devant le bâtiment principal.", reward: 'Peluche Hello Kitty + Rôle "the goat" + 1 800 XP' },
    19: { title: "Invitation", type: "invite", goal: 4, description: "Invite 4 amis sur le Discord.", reward: "300 IG + Rôle \"Sociable\" + 1 000 XP" },
    20: { title: "VIP en jeu", type: "manual", goal: 1, description: "[SchoolRP] Passe 2 heures en jeu sur School RP.", reward: "VIP Classique (1 mois) + 2 500 XP" },

    21: { title: "Cap des 300 messages", type: "messages", goal: 300, description: "Envoie 300 messages.", reward: "3 000 IG + 2 100 XP" },
    22: { title: "Économies en jeu", type: "manual", goal: 1, description: "[SchoolRP] Réussis à économiser 50 000 IG en jeu.", reward: "3 500 IG + 100 Jetons + 2 200 XP" },
    23: { title: "Voix d'or", type: "voice", goal: 300, description: "Passe 5h en vocal. Compte uniquement le temps réel passé en vocal.", reward: "2 500 IG" },
    24: { title: "Sympa", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen de toi où tu portes le proviseur.", reward: "Rôle \"Sous le bureau\" + 2 400 XP" },
    25: { title: "Le grand cap des messages", type: "messages", goal: 400, description: "Cumule 400 messages sur le serveur.", reward: "1ère Peluche Kuromi + 3 000 IG + 2 500 XP" },

    26: { title: "Séance School RP II", type: "manual", goal: 1, description: "[SchoolRP] Passe 3h en jeu sur School RP.", reward: "Rôle \"Chômeur\" + 1 000 IG" },
    27: { title: "Cap des 500 messages", type: "messages", goal: 500, description: "Envoie 500 messages.", reward: "3 500 IG + 2 700 XP" },
    28: { title: "Animation vocale", type: "manual", goal: 2, description: "[SchoolRP] Participe à 2 events vocaux de la famille.", reward: "VIP classique (1 semaine)" },
    29: { title: "En véhicule", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen de ton personnage sur un vélo en étant jardinier(è).", reward: "1 600 IG" },
    30: { title: "VIP Suprême", type: "hybrid", goal: 600, description: "Cumule 600 messages et 4h de vocal au total. Le temps vocal ne compte que pendant les vrais moments en vocal.", reward: "VIP Suprême (1 sem.) + 3 000 XP" },

    31: { title: "Cap des 700 messages", type: "messages", goal: 700, description: "Envoie 700 messages.", reward: "4 000 IG" },
    32: { title: "Staff en vue", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen avec un membre du staff en jeu.", reward: "Rôle \"Discret\" + 3 200 XP" },
    33: { title: "Marathon vocal", type: "voice", goal: 900, description: "Passe 15h en vocal. Compte seulement le temps réel en vocal.", reward: "3 000 IG + 3 300 XP" },
    34: { title: "Recruteur en herbe", type: "invite", goal: 7, description: "Invite 7 personnes sur le Discord.", reward: "100 Jetons + 3 400 XP" },
    35: { title: "Élite de la Famille", type: "manual", goal: 1, description: "[SchoolRP] Prends une photo avec au moins 1 membre de 5 familles différentes.", reward: "Rôle \"Famous\" + 3 000 IG" },
    36: { title: "Cap des 750 messages", type: "messages", goal: 750, description: "Envoie 750 messages.", reward: "2e Peluche Kuromi + 5 000 IG" },
    37: { title: "Session active School RP", type: "manual", goal: 1, description: "[SchoolRP] Passe 70 heures sur School RP.", reward: "Vélo + 3 700 XP" },
    38: { title: "Le millier de messages", type: "messages", goal: 800, description: "Atteins 800 messages sur le serveur.", reward: "6 000 IG + 3 800 XP" },
    39: { title: "Vocal legend", type: "voice", goal: 480, description: "Passe 8h en vocal au total. Compte uniquement le temps réel passé en vocal.", reward: "3 000 IG + 150 Jetons" },
    40: { title: "Le casse-tête de la planque", type: "manual", goal: 1, description: "[SchoolRP] Trouve et prends un screen de l'endroit le plus haut ou caché de la map.", reward: "Rôle \"Ombre\" + 2 000 XP" },

    41: { title: "Cap des 900 messages", type: "messages", goal: 900, description: "Envoie 900 messages.", reward: "6 500 IG + 4 100 XP" },
    42: { title: "Fortunes de famille", type: "manual", goal: 1, description: "[SchoolRP] Prouve que tu as accumulé 90 000 IG en jeu.", reward: "4 000 IG + 200 Jetons + 4 200 XP" },
    43: { title: "Voix permanente", type: "voice", goal: 1500, description: "Passe 25h en vocal au total. Compte uniquement le temps réel en vocal.", reward: "VIP Suprême (1 semaine) + 2 000 IG + 4 300 XP" },
    44: { title: "Longue session RP", type: "manual", goal: 1, description: "[SchoolRP] Passe 5 heures sur School RP.", reward: "300 Jetons" },
    45: { title: "Le chimiste de la rue", type: "manual", goal: 1, description: "[SchoolRP] Deviens chimiste au camp des caïds.", reward: "6 000 IG" },
    46: { title: "Le convoi exceptionnel", type: "manual", goal: 1, description: "[SchoolRP] Escorte un haut gradé ou un membre clé de la famille à travers la voiture sans te faire intercepter.", reward: "Rôle \"Braqueur\" + 5 000 IG + 4 600 XP" },
    47: { title: "Grand parrain", type: "invite", goal: 9, description: "Invite 9 personnes sur le Discord.", reward: "200 Jetons" },
    48: { title: "Sac à dos surchargé", type: "manual", goal: 1, description: "[SchoolRP] Prends un screen de ton inventaire complet.", reward: "3e Peluche Kuromi + Rôle \"Inventaire plein\"" },
    49: { title: "Vétéran de la famille", type: "hybrid", goal: 1500, description: "Cumule 1 500 messages et 20h de vocal au total. Le temps vocal compte uniquement si tu es réellement en vocal.", reward: "10 000 IG + 500 Jetons + 4 900 XP" },
    50: { title: "L'Empire de la Famille", type: "hybrid", goal: 3000, description: "[SchoolRP] Réaliser l'ultime consécration : accumuler 100 000 IG de fortune personnelle, cumuler 50h de vocal et atteindre 3 000 messages.", reward: "Le Jet-Ski Suprême + Rôle \"Légende Vivante\" + 40 000 IG" },
    51: { title: "Test légendaire", type: "messages", goal: 5, description: "Envoie 5 messages sur le serveur et joins une capture d’écran comme preuve dans le salon indiqué.", reward: "Aucune récompense (quête de test)" }
};

const PREVIOUS_SPECIAL_QUEST_NUMBERS = new Set([10, 14, 20, 23, 25, 30, 37, 40, 50]);
const PREVIOUS_V3_SPECIAL_QUEST_NUMBERS = new Set([10, 14, 20, 22, 23, 25, 30, 34, 37, 39, 40, 42, 44, 46, 49, 50]);
const TEST_LEGENDARY_QUEST_NUMBER = 51;
const SPECIAL_QUEST_NUMBERS = new Set([10, 18, 20, 22, 25, 28, 30, 34, 36, 37, 39, 42, 43, 44, 47, 48, 49, 50, TEST_LEGENDARY_QUEST_NUMBER]);
const LEGENDARY_QUEST_NUMBERS = new Set([37, 43, 49, 50, TEST_LEGENDARY_QUEST_NUMBER]);
const SPECIAL_QUESTS_CONFIG = Object.fromEntries(
    [...SPECIAL_QUEST_NUMBERS].map(number => [String(number), ALL_QUESTS_CONFIG[number]])
);
const QUESTS_CONFIG = Object.fromEntries(
    Object.entries(ALL_QUESTS_CONFIG)
        .filter(([number]) => !SPECIAL_QUEST_NUMBERS.has(Number(number)))
        .map(([, quest], index) => [index + 1, quest])
);
const QUEST_STATE_VERSION = 4;
const STANDARD_QUEST_COUNT = Object.keys(QUESTS_CONFIG).length;

const DAY_MS = 24 * 60 * 60 * 1000;
const SPECIAL_CLAIM_DURATION_MS = 14 * DAY_MS;

function getRandomSpecialSpawnDelay() {
    return Math.floor((1 + Math.random() * 6) * DAY_MS);
}

const QUESTS_FILE = './questsData.json';
const SPECIAL_QUESTS_FILE = './specialQuestsData.json';
const QUEST_PROOF_REQUESTS_FILE = './questProofRequests.json';
const ROULETTE_FILE = './rouletteData.json';
const LEVELS_FILE = path.join(__dirname, 'levelsData.json');
const LEVELS_BACKUP_FILE = path.join(__dirname, 'levelsData.json.bak');
const TOKENS_FILE = './tokensData.json';
const TOKEN_DROP_EMOJI = '🎁';
const ROULETTE_SPIN_TOKEN_COST = 100;
const MAX_PAID_ROULETTE_SPINS = 10;
const DAILY_TOKEN_BASE_REWARD = 25;
const DAILY_TOKEN_STREAK_STEP = 10;
const DAILY_TOKEN_MAX_REWARD = 100;
const rouletteSpinsInProgress = new Set();

const ROULETTE_REWARDS = [
    { label: 'Rôle 777', type: 'role', value: '777', chance: 1 },
    { label: '+1 tour bonus', type: 'bonus_spin', value: 1, chance: 4 },
    { label: 'Rôle mystère exclusif', type: 'unique_role', value: 'Mystère de la Roulette', chance: 1 },
    { label: '300 IG', type: 'ig', value: 300, chance: 8 },
    { label: 'Rôle Lucky', type: 'role', value: 'Lucky', chance: 15 },
    { label: '200 XP', type: 'xp', value: 200, chance: 25 },
    { label: 'Rien', type: 'none', value: 0, chance: 46 }
];

const UNIQUE_ROULETTE_ROLE_TITLES = ['Vainqueur', 'Champion', 'Élu', 'Maître', 'Légende', 'Prodige', 'As', 'Favori', 'Virtuose', 'Star'];
const UNIQUE_ROULETTE_ROLE_FIELDS = ['de la roulette', 'de la chance', 'du hasard', 'du grand tirage', 'de la fortune', 'des jetons', 'du destin', 'du jackpot'];

function buildUniqueRouletteRoleName(guild) {
    const existingNames = new Set([...guild.roles.cache.values()].map(role => role.name.toLocaleLowerCase('fr')));
    const availableTitles = UNIQUE_ROULETTE_ROLE_TITLES.flatMap(title =>
        UNIQUE_ROULETTE_ROLE_FIELDS.map(field => `${title} ${field}`)
    ).filter(title => !existingNames.has(title.toLocaleLowerCase('fr')));

    if (availableTitles.length === 0) {
        throw new Error('Tous les titres uniques de rôle de roulette sont déjà utilisés sur ce serveur.');
    }

    return availableTitles[Math.floor(Math.random() * availableTitles.length)];
}

function loadRouletteData() {
    if (fs.existsSync(ROULETTE_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(ROULETTE_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : {};
        } catch (err) {
            console.error('Erreur lecture rouletteData.json :', err);
        }
    }
    return {};
}

function saveRouletteData(data) {
    fs.writeFileSync(ROULETTE_FILE, JSON.stringify(data, null, 2));
}

function loadTokensData() {
    if (fs.existsSync(TOKENS_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : {};
        } catch (err) {
            console.error('Erreur lecture tokensData.json :', err);
        }
    }
    return {};
}

function saveTokensData(data) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(data, null, 2));
}

function getTokenWallet(data, guildId, userId) {
    data[guildId] ||= {};
    data[guildId].wallets ||= {};
    data[guildId].wallets[userId] ||= { balance: 0, dailyStreak: 0, lastDailyClaim: null };
    const wallet = data[guildId].wallets[userId];
    wallet.balance = Math.max(0, Number(wallet.balance) || 0);
    wallet.dailyStreak = Math.max(0, Number(wallet.dailyStreak) || 0);
    return wallet;
}

function getTokenEconomySettings(guildId) {
    const raw = savedConfigs[guildId]?.tokenEconomy || {};
    return {
        spinCost: Number.isInteger(raw.spinCost) && raw.spinCost >= 1 && raw.spinCost <= 1000000
            ? raw.spinCost
            : ROULETTE_SPIN_TOKEN_COST,
        maxPaidSpins: Number.isInteger(raw.maxPaidSpins) && raw.maxPaidSpins >= 1 && raw.maxPaidSpins <= 10
            ? raw.maxPaidSpins
            : MAX_PAID_ROULETTE_SPINS,
        dailyBaseReward: Number.isInteger(raw.dailyBaseReward) && raw.dailyBaseReward >= 1 && raw.dailyBaseReward <= 100000
            ? raw.dailyBaseReward
            : DAILY_TOKEN_BASE_REWARD,
        dailyStreakStep: Number.isInteger(raw.dailyStreakStep) && raw.dailyStreakStep >= 0 && raw.dailyStreakStep <= 100000
            ? raw.dailyStreakStep
            : DAILY_TOKEN_STREAK_STEP,
        dailyMaxReward: Number.isInteger(raw.dailyMaxReward) && raw.dailyMaxReward >= 1 && raw.dailyMaxReward <= 100000
            ? raw.dailyMaxReward
            : DAILY_TOKEN_MAX_REWARD
    };
}

function addTokens(guildId, userId, amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new RangeError('Le montant de jetons doit être un entier positif.');
    }
    const data = loadTokensData();
    const wallet = getTokenWallet(data, guildId, userId);
    wallet.balance = Math.max(0, Number(wallet.balance) || 0) + amount;
    saveTokensData(data);
    return wallet.balance;
}

function getUtcDateKey(timestamp = Date.now()) {
    return new Date(timestamp).toISOString().slice(0, 10);
}

function claimDailyTokens(guildId, userId) {
    const data = loadTokensData();
    const wallet = getTokenWallet(data, guildId, userId);
    const today = getUtcDateKey();
    if (wallet.lastDailyClaim === today) {
        return {
            claimed: false,
            streak: Math.max(0, Number(wallet.dailyStreak) || 0),
            balance: Math.max(0, Number(wallet.balance) || 0)
        };
    }

    const yesterday = getUtcDateKey(Date.now() - DAY_MS);
    wallet.dailyStreak = wallet.lastDailyClaim === yesterday
        ? Math.max(0, Number(wallet.dailyStreak) || 0) + 1
        : 1;
    wallet.lastDailyClaim = today;
    const settings = getTokenEconomySettings(guildId);
    const reward = Math.min(settings.dailyMaxReward, settings.dailyBaseReward + (wallet.dailyStreak - 1) * settings.dailyStreakStep);
    wallet.balance = Math.max(0, Number(wallet.balance) || 0) + reward;
    saveTokensData(data);
    return { claimed: true, reward, streak: wallet.dailyStreak, balance: wallet.balance };
}

function claimTokenDrop(guildId, messageId, userId) {
    const data = loadTokensData();
    const activeDrop = data[guildId]?.activeDrop;
    if (!activeDrop || activeDrop.messageId !== messageId || activeDrop.claimedBy) return null;
    if (Number(activeDrop.expiresAt) <= Date.now()) return null;

    const wallet = getTokenWallet(data, guildId, userId);
    activeDrop.claimedBy = userId;
    wallet.balance = Math.max(0, Number(wallet.balance) || 0) + Number(activeDrop.amount);
    saveTokensData(data);
    return { amount: activeDrop.amount, balance: wallet.balance };
}

async function publishTokenDrop(guild, channel, amount) {
    const data = loadTokensData();
    data[guild.id] ||= {};
    const activeDrop = data[guild.id].activeDrop;
    if (activeDrop && !activeDrop.claimedBy && Number(activeDrop.expiresAt) > Date.now()) return null;

    const embed = new EmbedBuilder()
        .setTitle('🎁 Cadeau de jetons !')
        .setDescription(`Le premier membre à réagir avec ${TOKEN_DROP_EMOJI} remporte **${amount} jetons** !`)
        .setColor(0xF1C40F)
        .setTimestamp();
    const message = await channel.send({ embeds: [embed] });

    data[guild.id].activeDrop = {
        messageId: message.id,
        channelId: channel.id,
        amount,
        expiresAt: Date.now() + 7 * DAY_MS,
        claimedBy: null
    };
    saveTokensData(data);
    try {
        await message.react(TOKEN_DROP_EMOJI);
    } catch (err) {
        const latestData = loadTokensData();
        if (latestData[guild.id]?.activeDrop?.messageId === message.id) {
            delete latestData[guild.id].activeDrop;
            saveTokensData(latestData);
        }
        await message.delete().catch(deleteError =>
            console.error('Impossible de supprimer le cadeau de jetons sans réaction :', deleteError)
        );
        throw err;
    }
    return message;
}

function getRandomTokenDropDelay() {
    return (24 + Math.floor(Math.random() * 49)) * 60 * 60 * 1000;
}

function loadRobloxLinksData() {
    if (fs.existsSync(ROBLOX_LINKS_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(ROBLOX_LINKS_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : { linked: {}, pending: {} };
        } catch (err) {
            console.error('Erreur lecture robloxLinks.json :', err);
        }
    }
    return { linked: {}, pending: {} };
}

function saveRobloxLinksData(data) {
    fs.writeFileSync(ROBLOX_LINKS_FILE, JSON.stringify(data, null, 2));
}

function getRobloxLinkKey(guildId, userId) {
    return `${guildId}:${userId}`;
}

function getLinkedRobloxAccount(guildId, userId) {
    const data = loadRobloxLinksData();
    const key = getRobloxLinkKey(guildId, userId);
    return data.linked && data.linked[key] ? data.linked[key] : null;
}

function setLinkedRobloxAccount(guildId, userId, payload) {
    const data = loadRobloxLinksData();
    const key = getRobloxLinkKey(guildId, userId);
    data.linked = data.linked || {};
    data.linked[key] = payload;
    if (data.pending && data.pending[guildId]) {
        delete data.pending[guildId][userId];
    }
    saveRobloxLinksData(data);
}

function removeLinkedRobloxAccount(guildId, userId) {
    const data = loadRobloxLinksData();
    const key = getRobloxLinkKey(guildId, userId);
    data.linked = data.linked || {};
    delete data.linked[key];
    saveRobloxLinksData(data);
}

function findRobloxLinkedRole(guild) {
    return guild.roles.cache.find(role =>
        ['roblox lié', 'roblox linked', 'roblox link', 'roblox'].some(name => role.name.toLowerCase() === name)
    );
}

async function resolveRobloxUser(robloxUsername) {
    try {
        const response = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [robloxUsername] })
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const user = Array.isArray(data?.data) ? data.data[0] : null;

        if (!user || user.errorMessage) {
            return null;
        }

        return {
            robloxId: String(user.id),
            robloxUsername: user.name,
            avatarUrl: `https://thumbnails.roblox.com/v1/users/avatar-headshot?userId=${user.id}&size=150x150&format=Png&isCircular=true`,
            profileUrl: `https://www.roblox.com/users/${user.id}/profile`
        };
    } catch (err) {
        console.error('Erreur résolution Roblox :', err);
        return null;
    }
}

function getRouletteState(userId, guildId) {
    const data = loadRouletteData();
    const key = getQuestStorageKey(userId, guildId);
    const state = data[key] || { spinsUsed: 0, bonusSpins: 0, lastResetAt: 0 };
    const resetMs = getRouletteSettings(guildId).cooldownHours * 60 * 60 * 1000;

    if (!state.lastResetAt || Date.now() - state.lastResetAt >= resetMs) {
        state.spinsUsed = 0;
        state.bonusSpins = 0;
        state.purchasedSpins = 0;
        state.lastResetAt = Date.now();
    }
    state.bonusSpins = Math.max(0, Number(state.bonusSpins) || 0);
    state.purchasedSpins = Math.max(0, Number(state.purchasedSpins) || 0);

    data[key] = state;
    saveRouletteData(data);
    return { data, state };
}

function pickRouletteReward() {
    const roll = Math.random() * 100;
    let cursor = 0;

    for (const reward of ROULETTE_REWARDS) {
        cursor += reward.chance;
        if (roll < cursor) {
            return reward;
        }
    }

    return ROULETTE_REWARDS[ROULETTE_REWARDS.length - 1];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildRouletteWheel(rewards, index, resultText = '') {
    const wheelSymbols = ['🔵', '🟠', '🟢', '🟣', '🟡', '🔴'];
    const rewardLines = rewards.map((reward, i) => {
        const line = `${wheelSymbols[i % wheelSymbols.length]} **${reward.label}** · \`${reward.chance} %\``;
        return i === index ? `▶️ ${line}` : `　 ${line}`;
    });
    const embed = new EmbedBuilder()
        .setTitle('🎰 Roulette')
        .setDescription(`La chance de chaque lot est indiquée à droite.\n\nTu veux plus de tours ? Achète-en avec \`/boutique\` ; récupère des jetons chaque jour avec \`/quotidien\`.\n\n${rewardLines.join('\n')}`)
        .setColor(resultText ? 0xF1C40F : 0x8E44AD);

    if (resultText) {
        embed.addFields({ name: 'Résultat', value: resultText });
    } else {
        embed.setFooter({ text: 'La roulette tourne…' });
    }

    return embed;
}

function buildRouletteShopEmbed(balance, spinsAvailable, guildId) {
    const settings = getTokenEconomySettings(guildId);
    const priceLines = Array.from({ length: spinsAvailable }, (_, index) => {
        const spinCount = index + 1;
        return `**${spinCount} tour${spinCount > 1 ? 's' : ''}** — ${spinCount * settings.spinCost} jetons`;
    });
    const description = [
        'Les jetons sont la monnaie virtuelle du serveur. Ils servent à acheter des tours supplémentaires pour la roulette.',
        'Gagne des jetons avec `/quotidien` ou en remportant un cadeau 🎁.',
        '',
        `Solde : **${balance} jetons**`,
        `Tours achetables cette semaine : **${spinsAvailable} / ${settings.maxPaidSpins}**`,
        '',
        '**Tarifs**',
        ...(priceLines.length ? priceLines : ['Tu as déjà atteint la limite d’achat pour cette semaine.']),
        '',
        'Choisis un pack dans le menu ci-dessous.'
    ].join('\n');

    return new EmbedBuilder()
        .setTitle('🛒 Boutique de tours')
        .setDescription(description)
        .setColor(0x8E44AD);
}

function buildRouletteShopSelect(spinsAvailable, guildId) {
    if (spinsAvailable < 1) return null;
    const settings = getTokenEconomySettings(guildId);
    return new StringSelectMenuBuilder()
        .setCustomId(`roulette_shop_${spinsAvailable}`)
        .setPlaceholder('Choisir le nombre de tours')
        .addOptions(Array.from({ length: spinsAvailable }, (_, index) => {
            const spinCount = index + 1;
            const price = spinCount * settings.spinCost;
            return {
                label: `${spinCount} tour${spinCount > 1 ? 's' : ''} — ${price} jetons`,
                value: String(spinCount),
                description: `Coût total : ${price} jetons`
            };
        }));
}

function normalizeQuestState(raw = {}) {
    const storedQuest = Number.isInteger(raw.currentQuest) && raw.currentQuest > 0 ? raw.currentQuest : 1;
    const needsMigration = raw.questConfigVersion !== QUEST_STATE_VERSION;
    const previousSpecialQuestNumbers = raw.questConfigVersion === 2
        ? PREVIOUS_SPECIAL_QUEST_NUMBERS
        : PREVIOUS_V3_SPECIAL_QUEST_NUMBERS;
    const previousStandardQuestNumbers = Object.keys(ALL_QUESTS_CONFIG)
        .map(Number)
        .filter(number => !previousSpecialQuestNumbers.has(number));
    const originalQuestNumber = raw.questConfigVersion === 2 || raw.questConfigVersion === 3
        ? previousStandardQuestNumbers[storedQuest - 1]
        : storedQuest;
    const wasSpecialQuest = needsMigration && originalQuestNumber !== undefined && (
        raw.questConfigVersion === 2
            ? PREVIOUS_SPECIAL_QUEST_NUMBERS.has(originalQuestNumber)
            : raw.questConfigVersion === 3
                ? PREVIOUS_V3_SPECIAL_QUEST_NUMBERS.has(originalQuestNumber)
                : PREVIOUS_SPECIAL_QUEST_NUMBERS.has(originalQuestNumber) || SPECIAL_QUEST_NUMBERS.has(originalQuestNumber)
    );
    const standardQuestNumbers = Object.keys(ALL_QUESTS_CONFIG)
        .map(Number)
        .filter(number => !SPECIAL_QUEST_NUMBERS.has(number));
    const nextStandardQuestIndex = needsMigration && originalQuestNumber !== undefined
        ? standardQuestNumbers.findIndex(number => number >= originalQuestNumber)
        : -1;
    const currentQuest = needsMigration
        ? (nextStandardQuestIndex >= 0 ? nextStandardQuestIndex + 1 : STANDARD_QUEST_COUNT + 1)
        : storedQuest;
    const progress = wasSpecialQuest ? 0 : (Number.isInteger(raw.progress) && raw.progress >= 0 ? raw.progress : 0);
    const completed = Boolean(raw.completed) || currentQuest > STANDARD_QUEST_COUNT;
    const started = Boolean(raw.started);
    const messageCount = wasSpecialQuest ? 0 : (Number.isInteger(raw.messageCount) && raw.messageCount >= 0 ? raw.messageCount : 0);
    const voiceSeconds = wasSpecialQuest ? 0 : (Number.isFinite(Number(raw.voiceSeconds)) && Number(raw.voiceSeconds) >= 0 ? Number(raw.voiceSeconds) : 0);
    const inviteCount = wasSpecialQuest ? 0 : (Number.isInteger(raw.inviteCount) && raw.inviteCount >= 0 ? raw.inviteCount : 0);
    return { currentQuest, progress, completed, started, messageCount, voiceSeconds, inviteCount, questConfigVersion: QUEST_STATE_VERSION };
}

function loadQuestsData() {
    if (fs.existsSync(QUESTS_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(QUESTS_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : {};
        } catch (err) {
            console.error('Erreur lecture questsData.json :', err);
        }
    }
    return {};
}

function saveQuestsData(data) {
    fs.writeFileSync(QUESTS_FILE, JSON.stringify(data, null, 2));
}

function loadSpecialQuestsData() {
    if (fs.existsSync(SPECIAL_QUESTS_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(SPECIAL_QUESTS_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : {};
        } catch (err) {
            console.error('Erreur lecture specialQuestsData.json :', err);
        }
    }
    return {};
}

function saveSpecialQuestsData(data) {
    fs.writeFileSync(SPECIAL_QUESTS_FILE, JSON.stringify(data, null, 2));
}

function loadQuestProofRequests() {
    if (fs.existsSync(QUEST_PROOF_REQUESTS_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(QUEST_PROOF_REQUESTS_FILE, 'utf8'));
            return raw && typeof raw === 'object' ? raw : {};
        } catch (err) {
            console.error('Erreur lecture questProofRequests.json :', err);
        }
    }
    return {};
}

function saveQuestProofRequests(data) {
    fs.writeFileSync(QUEST_PROOF_REQUESTS_FILE, JSON.stringify(data, null, 2));
}

function getSpecialGuildState(data, guildId) {
    if (!data[guildId] || typeof data[guildId] !== 'object') {
        data[guildId] = {};
    }

    const state = data[guildId];
    state.completedQuestNumbers = Array.isArray(state.completedQuestNumbers) ? state.completedQuestNumbers : [];
    state.retryAt = state.retryAt && typeof state.retryAt === 'object' ? state.retryAt : {};
    state.offers = Array.isArray(state.offers) ? state.offers : [];
    if (state.activeOffer && !state.offers.some(offer => offer.messageId === state.activeOffer.messageId)) {
        state.offers.push(state.activeOffer);
    }
    delete state.activeOffer;
    for (const offer of state.offers) {
        if (!LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber))) continue;
        if (offer.status !== 'legendary') {
            offer.status = 'legendary';
            offer.progressByUser = {};
            if (offer.claimedBy) {
                offer.progressByUser[offer.claimedBy] = offer.progress || {
                    progress: 0,
                    messageCount: 0,
                    voiceSeconds: 0,
                    inviteCount: 0
                };
            }
            offer.needsLegendaryRefresh = true;
        }
        offer.progressByUser ||= {};
        offer.proofSubmissions ||= {};
        offer.proofRequests ||= {};
        if (offer.status === 'claimed' &&
            isProofQuest(SPECIAL_QUESTS_CONFIG[String(offer.questNumber)]) &&
            offer.proofButtonsVersion !== 1) {
            offer.needsProofRefresh = true;
            offer.proofButtonsVersion = 1;
        }
    }
    state.enabled = state.enabled !== false;
    state.nextSpawnAt = Number(state.nextSpawnAt) || 0;
    return state;
}

function getClaimedSpecialQuest(guildId, userId) {
    const data = loadSpecialQuestsData();
    const state = data[guildId] && getSpecialGuildState(data, guildId);
    const offer = state && state.offers.find(item => item.status === 'claimed' && item.claimedBy === userId);
    if (!offer) return null;
    const quest = SPECIAL_QUESTS_CONFIG[String(offer.questNumber)];
    return quest ? { data, state, offer, quest } : null;
}

function getSpecialQuestProgressText(quest, progress = {}) {
    if (quest.type === 'voice') {
        return `${Math.floor((Number(progress.voiceSeconds) || 0) / 60)} / ${quest.goal} min`;
    }
    if (quest.type === 'hybrid') {
        const goals = getHybridQuestGoals(quest);
        return `${Number(progress.messageCount) || 0} / ${goals.messageGoal} messages • ${Math.floor((Number(progress.voiceSeconds) || 0) / 60)} / ${Math.floor(goals.voiceSecondsGoal / 60)} min`;
    }
    if (quest.type === 'invite') {
        return `${Number(progress.inviteCount) || 0} / ${quest.goal} invitations`;
    }
    if (quest.type === 'manual') {
        return `${Number(progress.progress) >= quest.goal ? quest.goal : 0} / ${quest.goal}`;
    }
    return `${Number(progress.progress) || 0} / ${quest.goal}`;
}

function hasReachedLegendaryActivityGoal(quest, progress = {}) {
    if (quest.type === 'messages') {
        return Number(progress.progress || 0) >= quest.goal;
    }
    if (quest.type === 'voice') {
        return Number(progress.voiceSeconds || 0) >= quest.goal * 60;
    }
    if (quest.type === 'hybrid') {
        const goals = getHybridQuestGoals(quest);
        return Number(progress.messageCount || 0) >= goals.messageGoal &&
            Number(progress.voiceSeconds || 0) >= goals.voiceSecondsGoal;
    }
    return true;
}

function buildSpecialQuestEmbed(offer, extraText = '') {
    const quest = SPECIAL_QUESTS_CONFIG[String(offer.questNumber)];
    if (!quest) return null;

    const isLegendary = LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber));
    const isClaimed = offer.status === 'claimed';
    const description = [
        quest.description,
        `\n**Récompense :** ${quest.reward}`,
        isLegendary
            ? '\n\n🏆 **Quête légendaire** — tout le monde peut avancer en même temps. Le premier dossier de preuve validé remporte la récompense.'
            : isClaimed ? `\n**Acceptée par :** <@${offer.claimedBy}>\n**Progression :** ${getSpecialQuestProgressText(quest, offer.progress)}` : '',
        extraText ? `\n\n${extraText}` : ''
    ].join('');

    return new EmbedBuilder()
        .setTitle(isLegendary ? '🏆 Quête légendaire ouverte à tous' : isClaimed ? '🟢 Quête spéciale acceptée' : '✨ Une quête flash vient d’apparaître !')
        .setDescription(description)
        .setColor(isLegendary ? 0x8E44AD : isClaimed ? 0x3BA55D : 0xF0A500)
        .setTimestamp();
}

function buildSpecialQuestButtons(offer) {
    const quest = SPECIAL_QUESTS_CONFIG[String(offer.questNumber)];
    if (LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber))) {
        return [new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`special_legendary_proof_${offer.questNumber}`)
                .setLabel('Envoyer ma preuve')
                .setStyle(ButtonStyle.Primary)
        )];
    }

    const claimButton = new ButtonBuilder()
        .setCustomId(`special_claim_${offer.questNumber}`)
        .setLabel(offer.status === 'claimed' ? `Prise par ${offer.claimedByName || 'un membre'}`.slice(0, 80) : 'Prendre')
        .setStyle(offer.status === 'claimed' ? ButtonStyle.Success : ButtonStyle.Primary)
        .setDisabled(offer.status === 'claimed');
    const buttons = [claimButton];

    if (offer.status === 'claimed' && isProofQuest(quest)) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`special_proof_${offer.questNumber}`)
                .setLabel('Envoyer ma preuve')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    return [new ActionRowBuilder().addComponents(...buttons)];
}

async function editSpecialOfferMessage(guild, offer, extraText, components = []) {
    if (!offer.channelId || !offer.messageId) return;
    const channel = await guild.channels.fetch(offer.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    const message = await channel.messages.fetch(offer.messageId).catch(() => null);
    if (!message) return;

    const embed = buildSpecialQuestEmbed(offer, extraText);
    if (embed) await message.edit({ embeds: [embed], components }).catch(() => {});
}

async function spawnSpecialQuest(guild, guildState, data, requestedQuestNumber = null) {
    const channelId = guildState.channelId || (savedConfigs[guild.id] || {}).specialQuestChannelId;
    const channel = channelId ? await guild.channels.fetch(channelId).catch(() => null) : null;
    if (!channel || !channel.isTextBased()) return false;

    const now = Date.now();
    const specialRoleId = guildState.specialQuestRoleId || (savedConfigs[guild.id] || {}).specialQuestRoleId;
    const retryQuestNumber = Number(guildState.retryQuestNumber);
    const eligibleQuestNumbers = Object.keys(SPECIAL_QUESTS_CONFIG)
        .map(Number)
        .filter(number => (number !== TEST_LEGENDARY_QUEST_NUMBER || number === requestedQuestNumber) &&
            !guildState.completedQuestNumbers.includes(number) &&
            !guildState.offers.some(offer => Number(offer.questNumber) === number) &&
            Number(guildState.retryAt[number] || 0) <= now);
    const questNumber = requestedQuestNumber !== null
        ? eligibleQuestNumbers.includes(requestedQuestNumber) ? requestedQuestNumber : null
        : eligibleQuestNumbers.includes(retryQuestNumber)
            ? retryQuestNumber
            : eligibleQuestNumbers[Math.floor(Math.random() * eligibleQuestNumbers.length)];

    if (!questNumber) return false;

    const isLegendary = LEGENDARY_QUEST_NUMBERS.has(questNumber);
    const offer = {
        questNumber,
        status: isLegendary ? 'legendary' : 'available',
        createdAt: now,
        channelId: channel.id,
        ...(isLegendary
            ? { progressByUser: {} }
            : { progress: { progress: 0, messageCount: 0, voiceSeconds: 0, inviteCount: 0 } })
    };
    const message = await channel.send({
        content: `${specialRoleId ? `<@&${specialRoleId}> ` : ''}${isLegendary
            ? '🏆 **Une quête légendaire est ouverte à tous !** Chacun peut avancer de son côté ; le premier dossier de preuve validé gagne.'
            : '✨ **Une quête flash vient d’apparaître !** Une seule personne peut la prendre.'}`,
        embeds: [buildSpecialQuestEmbed(offer)],
        components: buildSpecialQuestButtons(offer),
        allowedMentions: { roles: specialRoleId ? [specialRoleId] : [] }
    }).catch(err => {
        console.error('Erreur publication quête spéciale :', err);
        return null;
    });
    if (!message) return false;

    offer.messageId = message.id;
    guildState.offers.push(offer);
    guildState.nextSpawnAt = now + getRandomSpecialSpawnDelay();
    if (isLegendary) {
        for (const [memberId, voiceState] of guild.voiceStates.cache) {
            if (voiceState.channelId && !voiceState.member?.user.bot) {
                specialVoiceQuestStart.set(getVoiceQuestKey(memberId, guild.id), now);
            }
        }
    }
    delete guildState.retryQuestNumber;
    saveSpecialQuestsData(data);
    return true;
}

async function processSpecialQuestsForGuild(guild) {
    const data = loadSpecialQuestsData();
    const guildState = getSpecialGuildState(data, guild.id);
    guildState.channelId = guildState.channelId || (savedConfigs[guild.id] || {}).specialQuestChannelId;
    if (!guildState.channelId) return;

    const now = Date.now();
    let offersChanged = false;
    for (const offer of [...guildState.offers]) {
        if (LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber))) {
            if (offer.needsLegendaryRefresh) {
                await editSpecialOfferMessage(
                    guild,
                    offer,
                    'Cette quête est maintenant légendaire : elle est ouverte à tous et le premier dossier de preuve validé gagne.',
                    buildSpecialQuestButtons(offer)
                );
                delete offer.needsLegendaryRefresh;
                offersChanged = true;
            }
            continue;
        }
        if (offer.needsProofRefresh) {
            await editSpecialOfferMessage(guild, offer, '', buildSpecialQuestButtons(offer));
            delete offer.needsProofRefresh;
            offersChanged = true;
        }
        const duration = offer.status === 'claimed' ? SPECIAL_CLAIM_DURATION_MS : 7 * DAY_MS;
        const startTime = Number(offer.status === 'claimed' ? offer.claimedAt : offer.createdAt) || now;
        if (now >= startTime + duration) {
            const questNumber = Number(offer.questNumber);
            guildState.offers = guildState.offers.filter(item => item.messageId !== offer.messageId);
            delete guildState.retryAt[questNumber];
            if (offer.claimedBy) {
                specialVoiceQuestStart.delete(getVoiceQuestKey(offer.claimedBy, guild.id));
            }
            const expirationText = offer.status === 'claimed'
                ? '⏳ Le délai de 14 jours est dépassé. Cette quête n’est plus attribuée à ce membre et pourra réapparaître.'
                : '⏳ Cette offre n’a pas été prise. Elle pourra réapparaître plus tard.';
            await editSpecialOfferMessage(guild, offer, expirationText);
            offersChanged = true;
        }
    }
    if (offersChanged) {
        saveSpecialQuestsData(data);
    }

    const hasActiveVoiceLegendary = guildState.offers.some(offer =>
        LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber)) &&
        ['voice', 'hybrid'].includes(SPECIAL_QUESTS_CONFIG[String(offer.questNumber)]?.type)
    );
    if (hasActiveVoiceLegendary) {
        for (const [memberId, voiceState] of guild.voiceStates.cache) {
            const voiceKey = getVoiceQuestKey(memberId, guild.id);
            if (voiceState.channelId && !voiceState.member?.user.bot && !specialVoiceQuestStart.has(voiceKey)) {
                specialVoiceQuestStart.set(voiceKey, now);
            }
        }
    }

    if (!guildState.enabled) return;

    if (!guildState.nextSpawnAt) {
        guildState.nextSpawnAt = now + getRandomSpecialSpawnDelay();
        saveSpecialQuestsData(data);
        return;
    }

    if (now < guildState.nextSpawnAt) return;
    const eligibleQuestNumbers = Object.keys(SPECIAL_QUESTS_CONFIG)
        .map(Number)
        .filter(number => number !== TEST_LEGENDARY_QUEST_NUMBER &&
            !guildState.completedQuestNumbers.includes(number) &&
            !guildState.offers.some(offer => Number(offer.questNumber) === number) &&
            Number(guildState.retryAt[number] || 0) <= now);
    if (eligibleQuestNumbers.length === 0) return;
    await spawnSpecialQuest(guild, guildState, data);
}

async function completeSpecialQuest(guild, data, guildState, offer, member) {
    const quest = SPECIAL_QUESTS_CONFIG[String(offer.questNumber)];
    if (!quest) return;

    const winnerId = member?.id || offer.claimedBy;
    if (!winnerId || guildState.completedQuestNumbers.includes(offer.questNumber)) return;
    offer.winnerId = winnerId;
    if (!guildState.completedQuestNumbers.includes(offer.questNumber)) {
        guildState.completedQuestNumbers.push(offer.questNumber);
    }
    guildState.offers = guildState.offers.filter(item => item.messageId !== offer.messageId);
    guildState.nextSpawnAt = Math.max(Number(guildState.nextSpawnAt) || 0, Date.now());
    if (offer.claimedBy) {
        specialVoiceQuestStart.delete(getVoiceQuestKey(offer.claimedBy, guild.id));
    }
    if (LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber))) {
        for (const key of specialVoiceQuestStart.keys()) {
            if (key.startsWith(`${guild.id}:`)) specialVoiceQuestStart.delete(key);
        }
    }
    saveSpecialQuestsData(data);

    if (member) {
        await grantQuestRoleReward(guild, member, quest.reward);
    }

    await editSpecialOfferMessage(guild, offer, `✅ Quête spéciale validée par <@${winnerId}>. La récompense **${quest.reward}** lui revient.`);
    const embed = new EmbedBuilder()
        .setTitle('✅ Quête spéciale validée')
        .setDescription(`<@${winnerId}> a terminé la quête spéciale **${quest.title}** et remporte : **${quest.reward}**.`)
        .setColor(0x00FF7F)
        .setTimestamp();
    await sendQuestLog(guild, embed);
}

async function addSpecialQuestProgress(guild, userId, activity, amount = 1) {
    const data = loadSpecialQuestsData();
    const guildState = data[guild.id] && getSpecialGuildState(data, guild.id);
    if (!guildState) return;
    let progressChanged = false;
    for (const offer of [...guildState.offers]) {
        const isLegendary = LEGENDARY_QUEST_NUMBERS.has(Number(offer.questNumber));
        if (isLegendary ? offer.status !== 'legendary' : offer.status !== 'claimed' || offer.claimedBy !== userId) continue;

        const quest = SPECIAL_QUESTS_CONFIG[String(offer.questNumber)];
        if (!quest || quest.type === 'manual') continue;
        let progress;
        if (isLegendary) {
            offer.progressByUser ||= {};
            progress = offer.progressByUser[userId] || (offer.progressByUser[userId] = {
                progress: 0,
                messageCount: 0,
                voiceSeconds: 0,
                inviteCount: 0
            });
        } else {
            progress = offer.progress || (offer.progress = { progress: 0, messageCount: 0, voiceSeconds: 0, inviteCount: 0 });
        }
        let isComplete = false;

        if (activity === 'message' && quest.type === 'messages') {
            progress.progress = (Number(progress.progress) || 0) + amount;
            isComplete = progress.progress >= quest.goal;
        } else if (activity === 'message' && quest.type === 'hybrid') {
            const goals = getHybridQuestGoals(quest);
            progress.messageCount = (Number(progress.messageCount) || 0) + amount;
            isComplete = progress.messageCount >= goals.messageGoal && Number(progress.voiceSeconds || 0) >= goals.voiceSecondsGoal;
        } else if (activity === 'voice' && (quest.type === 'voice' || quest.type === 'hybrid')) {
            progress.voiceSeconds = (Number(progress.voiceSeconds) || 0) + amount;
            if (quest.type === 'voice') {
                isComplete = progress.voiceSeconds >= quest.goal * 60;
            } else {
                const goals = getHybridQuestGoals(quest);
                isComplete = Number(progress.messageCount || 0) >= goals.messageGoal && progress.voiceSeconds >= goals.voiceSecondsGoal;
            }
        } else if (activity === 'invite' && quest.type === 'invite') {
            progress.inviteCount = (Number(progress.inviteCount) || 0) + amount;
            isComplete = progress.inviteCount >= quest.goal;
        } else if (activity === 'reaction' && quest.type === 'reaction') {
            progress.progress = (Number(progress.progress) || 0) + amount;
            isComplete = progress.progress >= quest.goal;
        }

        progressChanged = true;
        if (isLegendary || !isComplete) {
            if (isLegendary && isComplete && !offer.readyUsers?.includes(userId)) {
                offer.readyUsers = [...(offer.readyUsers || []), userId];
                const member = await guild.members.fetch(userId).catch(() => null);
                if (member) {
                    await sendMP(member.user, `🏆 Tu as atteint les objectifs Discord de la quête légendaire **${quest.title}**. Envoie ta preuve à l’aide du bouton de l’annonce ; le staff vérifiera les éléments et le premier dossier validé gagnera.`);
                }
            }
            continue;
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        await completeSpecialQuest(guild, data, guildState, offer, member);
    }

    if (progressChanged) saveSpecialQuestsData(data);
}

function getQuestStorageKey(userId, guildId) {
    return guildId ? `${guildId}:${userId}` : userId;
}

function getQuestState(userId, guildId) {
    const data = loadQuestsData();
    const storageKey = getQuestStorageKey(userId, guildId);
    const legacyState = data[userId];
    const currentState = data[storageKey] || legacyState;
    const state = normalizeQuestState(currentState);
    data[storageKey] = state;

    if (legacyState && storageKey !== userId && !data[userId]) {
        delete data[userId];
    }

    return { data, state, storageKey };
}

function getQuestGoalText(quest) {
    if (!quest) return 'Objectif';
    if (quest.type === 'reaction') return 'Réagir à';
    if (quest.type === 'voice') return 'Passer';
    if (quest.type === 'invite') return 'Inviter';
    return 'Envoyer';
}

function formatQuestProgress(quest, value) {
    if (!quest) return `${value}`;
    if (quest.type === 'voice') {
        const minutes = Math.floor(value / 60);
        return `${minutes} min`;
    }
    return `${value}`;
}

function getHybridQuestGoals(quest) {
    if (!quest || quest.type !== 'hybrid') return { messageGoal: 0, voiceSecondsGoal: 0 };

    const description = quest.description || '';
    const messageMatch = description.match(/(\d[\d\s]*)\s*messages/i);
    const voiceMatch = description.match(/(\d[\d\s]*)\s*(?:h|heure|heures|min|minute|minutes)?\s*(?:de\s+)?vocal/i);

    let messageGoal = 0;
    let voiceSecondsGoal = 0;

    if (messageMatch) {
        messageGoal = Number(String(messageMatch[1]).replace(/\s+/g, '')) || 0;
    }

    if (voiceMatch) {
        const rawValue = String(voiceMatch[1]).replace(/\s+/g, '');
        const numeric = Number(rawValue) || 0;
        const lower = voiceMatch[0].toLowerCase();
        if (lower.includes('h') || lower.includes('heure')) {
            voiceSecondsGoal = numeric * 3600;
        } else if (lower.includes('min')) {
            voiceSecondsGoal = numeric * 60;
        } else {
            voiceSecondsGoal = numeric * 60;
        }
    }

    return { messageGoal, voiceSecondsGoal };
}

async function grantQuestRoleReward(guild, member, rewardText = '', configuredRoleId = '') {
    if (!guild || !member || !rewardText) return false;

    let granted = false;
    const xpMatch = rewardText.match(/(?:^|[^\d])([\d][\d\s.,]*)\s*XP\b/i);
    const xpReward = xpMatch ? Number(xpMatch[1].replace(/\D/g, '')) : 0;
    if (xpMatch && (!Number.isSafeInteger(xpReward) || xpReward > 1000000000)) {
        console.error(`Montant d’XP de quête invalide pour le membre ${member.id}.`);
    }
    if (Number.isSafeInteger(xpReward) && xpReward > 0 && xpReward <= 1000000000 && getLevelSettings(guild.id).enabled) {
        const { record, oldLevel, newLevel } = addLevelXp(guild.id, member.id, xpReward);
        granted = true;
        if (newLevel > oldLevel) {
            await grantLevelRewards(guild, member.id, oldLevel, newLevel);
            await sendLevelUpAnnouncement(
                guild,
                member.user,
                getCanvasDisplayName(member.user),
                oldLevel,
                newLevel,
                record.xp
            );
        }
    }

    const match = rewardText.match(/Rôle\s+["“]([^"”]+)["”]/i);
    const role = configuredRoleId
        ? await guild.roles.fetch(configuredRoleId).catch(err => {
            console.error(`Erreur récupération du rôle de quête ${configuredRoleId} :`, err);
            return null;
        })
        : match
            ? guild.roles.cache.find(r => r.name.toLowerCase() === match[1].trim().toLowerCase())
            : null;

    if (!role) {
        if (configuredRoleId || match) {
            console.warn(`Rôle de quête introuvable : ${configuredRoleId || match[1].trim()}`);
        }
        return granted;
    }

    try {
        await member.roles.add(role);
        return true;
    } catch (err) {
        console.error(`Erreur attribution rôle de quête ${role.name} :`, err);
        return granted;
    }
}

function getQuestProgressText(quest, state) {
    if (!quest) return '0';

    if (quest.type === 'voice') {
        return `${formatQuestProgress(quest, Number(state.voiceSeconds || state.progress || 0))} / ${quest.goal} min`;
    }

    if (quest.type === 'invite') {
        const count = Number(state.inviteCount || state.progress || 0);
        return `${count} / ${quest.goal} invites`;
    }

    if (quest.type === 'hybrid') {
        const goals = getHybridQuestGoals(quest);
        const messageCount = Number(state.messageCount || 0);
        const voiceMinutes = Math.floor((Number(state.voiceSeconds || 0)) / 60);
        return `${messageCount} messages / ${voiceMinutes} min`;
    }

    if (quest.type === 'manual') {
        return `${state.progress >= 1 ? 1 : 0} / 1`;
    }

    return `${Number(state.progress || 0)} / ${quest.goal}`;
}

function isProofQuest(quest) {
    if (!quest) return false;
    const description = typeof quest.description === 'string' ? quest.description : '';
    return quest.type === 'manual' || description.includes('[SchoolRP]');
}

function fillRoundedRect(context, x, y, width, height, radius, color, borderColor = null) {
    const corner = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + corner, y);
    context.lineTo(x + width - corner, y);
    context.quadraticCurveTo(x + width, y, x + width, y + corner);
    context.lineTo(x + width, y + height - corner);
    context.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
    context.lineTo(x + corner, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - corner);
    context.lineTo(x, y + corner);
    context.quadraticCurveTo(x, y, x + corner, y);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    if (borderColor) {
        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.stroke();
    }
}

function hexToRgba(hex, alpha) {
    const [red, green, blue] = hex.match(/.{2}/g).map(value => parseInt(value, 16));
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

async function createQuestLeaderboardImage(entries, userRank, footerText = `TON RANG  #${userRank || 'N/A'}`, theme = {}) {
    const width = 1200;
    const rowHeight = 62;
    const rowGap = 12;
    const listTop = 245;
    const visibleRows = Math.max(entries.length, 1);
    const height = Math.max(470, listTop + visibleRows * (rowHeight + rowGap) + 130);
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const backgroundColor = theme.backgroundColor || '111A19';
    const rowColor = theme.rowColor || '26312E';
    const borderColor = theme.borderColor || 'D9AA61';
    const textColor = theme.textColor || 'F4F0E7';
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, `#${backgroundColor}`);
    background.addColorStop(0.56, `#${backgroundColor}`);
    background.addColorStop(1, `#${backgroundColor}`);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const backgroundImage = await loadCanvasImage(theme.backgroundImage);
    if (backgroundImage) {
        const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
        const imageWidth = backgroundImage.width * scale;
        const imageHeight = backgroundImage.height * scale;
        context.drawImage(backgroundImage, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
        context.fillStyle = hexToRgba(backgroundColor, 0.58);
        context.fillRect(0, 0, width, height);
    }

    const glow = context.createRadialGradient(1010, 80, 10, 1010, 80, 570);
    glow.addColorStop(0, hexToRgba(borderColor, 0.2));
    glow.addColorStop(1, hexToRgba(borderColor, 0));
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = hexToRgba(borderColor, 0.045);
    context.lineWidth = 1;
    for (let offset = -height; offset < width; offset += 72) {
        context.beginPath();
        context.moveTo(offset, 0);
        context.lineTo(offset - height, height);
        context.stroke();
    }

    fillRoundedRect(context, 52, 48, 8, 130, 4, `#${borderColor}`);
    context.fillStyle = `#${borderColor}`;
    context.font = '600 19px sans-serif';
    context.fillText('BMF  /  TABLEAU DES QUÊTES', 84, 75);
    context.fillStyle = `#${textColor}`;
    context.font = '700 52px sans-serif';
    context.fillText('CLASSEMENT', 80, 140);
    context.fillStyle = '#b3bdb5';
    context.font = '400 22px sans-serif';
    context.fillText('Les membres les plus avancés de la famille', 84, 178);

    context.fillStyle = hexToRgba(borderColor, 0.82);
    context.font = '600 16px sans-serif';
    context.fillText('RANG', 90, 222);
    context.fillText('MEMBRE', 190, 222);
    context.textAlign = 'right';
    context.fillText('NIVEAU', 1090, 222);
    context.textAlign = 'left';

    if (entries.length === 0) {
        fillRoundedRect(context, 70, listTop, 1060, rowHeight, 13, `#${rowColor}`, `#${borderColor}`);
        context.fillStyle = `#${textColor}`;
        context.font = '500 22px sans-serif';
        context.fillText('Aucun membre n’a commencé les quêtes pour le moment.', 100, listTop + 39, 990);
    }

    const rankColors = ['#e6bd73', '#c2d0c8', '#c98c68'];
    entries.forEach((entry, index) => {
        const y = listTop + index * (rowHeight + rowGap);
        const rankColor = rankColors[index] || `#${borderColor}`;
        fillRoundedRect(context, 70, y, 1060, rowHeight, 13, `#${rowColor}`, `#${borderColor}`);
        fillRoundedRect(context, 70, y, 5, rowHeight, 3, rankColor);

        context.fillStyle = rankColor;
        context.font = '700 25px sans-serif';
        context.fillText(String(index + 1).padStart(2, '0'), 98, y + 40);

        context.fillStyle = `#${textColor}`;
        context.font = '600 24px sans-serif';
        context.fillText(String(entry.displayName || 'Utilisateur inconnu').slice(0, 34), 190, y + 39, 650);

        context.textAlign = 'right';
        context.fillStyle = `#${borderColor}`;
        context.font = '700 21px sans-serif';
        context.fillText(`NIVEAU ${entry.currentQuest}`, 1090, y + 38);
        context.textAlign = 'left';
    });

    const footerY = listTop + visibleRows * (rowHeight + rowGap) + 32;
    context.strokeStyle = hexToRgba(borderColor, 0.4);
    context.beginPath();
    context.moveTo(80, footerY - 18);
    context.lineTo(1120, footerY - 18);
    context.stroke();
    context.fillStyle = `#${textColor}`;
    context.font = '500 20px sans-serif';
    context.fillText(footerText, 84, footerY + 18);
    context.textAlign = 'right';
    context.fillStyle = hexToRgba(textColor, 0.7);
    context.font = '400 17px sans-serif';
    context.fillText('BMF  •  QUÊTES', 1115, footerY + 18);

    return canvas.toBuffer('image/png');
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ] 
});

const warns = new Map();
const embedBuilders = new Map();
const activeTickets = new Map();
const voiceQuestStart = new Map();
const specialVoiceQuestStart = new Map();
const legendaryProofSubmissionLocks = new Set();
const legendaryQuestValidationLocks = new Set();
const levelMessageCooldown = new Map();
const levelVoiceStart = new Map();

function getVoiceQuestKey(userId, guildId) {
    return `${guildId}:${userId}`;
}
const normalVoiceQuestLocks = new Set();
const pendingProofs = new Map();
// Stocke les invitations actives : guildId -> Map(code -> nombre d'utilisations)
const invitesCache = new Map();
const inviteFetchQueues = new Map();
const pendingInviteUses = new Map();
// Stocke l'auteur de l'invitation pour chaque utilisateur : userId -> { inviterTag, code }
const invitedByCache = new Map();

// Charger les configurations persistantes depuis le fichier JSON
let savedConfigs = {};
const rankupRoleSelection = new Map();

if (fs.existsSync(CONFIG_FILE)) {
    try {
        savedConfigs = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
        console.error("Erreur lecture config.json :", e);
    }
}

function saveConfigsToFile() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(savedConfigs, null, 2));
}

const QUEST_TYPES = new Set(['messages', 'voice', 'invite', 'manual', 'reaction', 'hybrid']);
const QUEST_MANAGER_PAGE_SIZE = 10;
const MAX_NORMAL_QUESTS = 100;

function getNormalQuestsConfig(guildId) {
    const configured = savedConfigs[guildId]?.normalQuestDefinitions;
    const source = Array.isArray(configured) && configured.length
        ? configured
        : Object.values(QUESTS_CONFIG);
    return source
        .filter(quest => quest && typeof quest === 'object')
        .map(quest => ({
            title: String(quest.title || 'Nouvelle quête').slice(0, 100),
            type: QUEST_TYPES.has(quest.type) ? quest.type : 'messages',
            goal: Math.max(1, Math.floor(Number(quest.goal) || 1)),
            description: String(quest.description || '').slice(0, 1000),
            reward: String(quest.reward || 'Aucune récompense').slice(0, 1000),
            roleId: typeof quest.roleId === 'string' ? quest.roleId : ''
        }))
        .reduce((quests, quest, index) => {
            quests[index + 1] = quest;
            return quests;
        }, {});
}

function saveNormalQuestsConfig(guildId, quests) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].normalQuestDefinitions = Object.values(quests);
    saveConfigsToFile();
}

function getQuestRewardDisplay(quest) {
    if (!quest) return 'Aucune récompense';
    return (quest.roleId ? `${quest.reward} + <@&${quest.roleId}>` : quest.reward).slice(0, 1024);
}

function removeNormalQuest(guildId, questNumber) {
    const quests = getNormalQuestsConfig(guildId);
    if (!quests[questNumber] || Object.keys(quests).length <= 1) return false;
    delete quests[questNumber];
    const reordered = Object.values(quests);
    saveNormalQuestsConfig(guildId, reordered);

    const data = loadQuestsData();
    const keyPrefix = `${guildId}:`;
    for (const [key, rawState] of Object.entries(data)) {
        if (!key.startsWith(keyPrefix) || !rawState || typeof rawState !== 'object') continue;
        const state = normalizeQuestState(rawState);
        if (state.currentQuest > questNumber) {
            state.currentQuest -= 1;
        } else if (state.currentQuest === questNumber) {
            state.progress = 0;
            state.messageCount = 0;
            state.voiceSeconds = 0;
            state.inviteCount = 0;
            state.completed = state.currentQuest > reordered.length;
        }
        data[key] = state;
    }
    saveQuestsData(data);
    return true;
}

function getRankupAnnouncementSettings(guildId) {
    const settings = (savedConfigs[guildId] || {}).rankupAnnouncementSettings || {};
    return {
        channelId: typeof settings.channelId === 'string' ? settings.channelId : '',
        testRoleId: typeof settings.testRoleId === 'string' ? settings.testRoleId : '',
        memberRoleId: typeof settings.memberRoleId === 'string' ? settings.memberRoleId : '',
        pingRoleId: typeof settings.pingRoleId === 'string' ? settings.pingRoleId : '',
        testMessage: typeof settings.testMessage === 'string'
            ? settings.testMessage
            : '🎉 Nous avons un nouveau test dans la famille ! Souhaitez la bienvenue à {user} et mettez-le à l’aise dans la BMF !',
        memberMessage: typeof settings.memberMessage === 'string'
            ? settings.memberMessage
            : '🎉 Félicitations à {user} qui a réussi son test ! Bienvenue dans la famille BMF, mets-toi à l’aise !'
    };
}

function saveRankupAnnouncementSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].rankupAnnouncementSettings = {
        ...getRankupAnnouncementSettings(guildId),
        ...updates
    };
    saveConfigsToFile();
    return getRankupAnnouncementSettings(guildId);
}

async function sendRankupAnnouncement(guild, targetMember, role, reason) {
    const settings = getRankupAnnouncementSettings(guild.id);
    const announcementType = role.id === settings.testRoleId
        ? 'test'
        : role.id === settings.memberRoleId
            ? 'member'
            : null;
    if (!announcementType || !settings.channelId) return null;

    const channel = await guild.channels.fetch(settings.channelId).catch(error => {
        console.error(`Erreur récupération du salon des annonces rankup (${guild.id}) :`, error);
        return null;
    });
    if (!channel?.isTextBased()) {
        console.error(`Le salon configuré pour les annonces rankup est introuvable ou n’est pas textuel (${guild.id}).`);
        return false;
    }

    const template = announcementType === 'test' ? settings.testMessage : settings.memberMessage;
    const message = template
        .replaceAll('{user}', `${targetMember}`)
        .replaceAll('{role}', role.name)
        .replaceAll('{raison}', reason);
    const content = `${settings.pingRoleId ? `<@&${settings.pingRoleId}> ` : ''}${message}`;
    try {
        await channel.send({
            content,
            allowedMentions: {
                parse: [],
                users: [targetMember.id],
                roles: settings.pingRoleId ? [settings.pingRoleId] : []
            }
        });
        return true;
    } catch (error) {
        console.error(`Erreur envoi de l’annonce rankup (${guild.id}) :`, error);
        return false;
    }
}

function getRouletteSettings(guildId) {
    const settings = (savedConfigs[guildId] || {}).rouletteSettings || {};
    return {
        maxSpins: Math.min(100, Math.max(1, Number(settings.maxSpins) || 3)),
        cooldownHours: Math.min(720, Math.max(1, Number(settings.cooldownHours) || 168))
    };
}

function saveRouletteSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].rouletteSettings = { ...getRouletteSettings(guildId), ...updates };
    saveConfigsToFile();
    return getRouletteSettings(guildId);
}

async function openTicketPanelBuilder(interaction, name) {
    embedBuilders.set(interaction.user.id, {
        mode: 'create',
        name,
        title: 'Titre par défaut',
        description: 'Description par défaut de ton embed.',
        color: '#2B2D31',
        footerText: '',
        footerIcon: '',
        timestamp: false,
        mainImage: '',
        thumbnail: '',
        categoryId: '',
        staffRoleId: '',
        ticketOptions: [
            { label: 'Support / Problème', value: 'probleme', description: 'Ouvrir un ticket pour de l’aide', emoji: '🔧' },
            { label: 'Recrutement', value: 'recrutement', description: 'Postuler dans l’équipe', emoji: '📋' }
        ]
    });

    const preview = new EmbedBuilder()
        .setTitle(`Aperçu : ${name}`)
        .setDescription('Utilise les boutons ci-dessous pour modifier le panneau et configurer le ticket.')
        .setColor(0x00FF00);
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('edit_basic').setLabel('Modifier le texte').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('edit_footer').setLabel('Modifier le footer').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('edit_images').setLabel('Modifier les images').setStyle(ButtonStyle.Secondary)
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('edit_ticket_setup').setLabel('Configurer le ticket').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('publish_embed').setLabel('Envoyer / Terminer').setStyle(ButtonStyle.Success)
    );

    return await interaction.reply({
        content: `✨ Création du panneau **${name}** en cours !`,
        embeds: [preview],
        components: [row1, row2],
        flags: [MessageFlags.Ephemeral]
    });
}

function getLevelSettings(guildId) {
    const settings = (savedConfigs[guildId] || {}).levelSettings || {};
    return {
        enabled: settings.enabled !== false,
        xpPerMessage: Math.max(1, Number(settings.xpPerMessage) || 10),
        cooldownSeconds: Math.max(0, Number(settings.cooldownSeconds) || 120),
        voiceXpPerInterval: Math.max(1, Number(settings.voiceXpPerInterval) || 10),
        voiceIntervalSeconds: Math.max(30, Number(settings.voiceIntervalSeconds) || 300),
        minimumVoiceMembers: Math.max(1, Number(settings.minimumVoiceMembers) || 1),
        rewards: Array.isArray(settings.rewards)
            ? settings.rewards.filter(reward => Number.isInteger(Number(reward.level)) && Number(reward.level) > 0 && typeof reward.roleId === 'string')
            : [],
        title: settings.title || '🎉 {user} passe au niveau {level} !',
        color: /^#?[0-9a-fA-F]{6}$/.test(settings.color || '') ? settings.color.replace('#', '') : 'EC59CB',
        imageUrl: typeof settings.imageUrl === 'string' ? settings.imageUrl : '',
        channelId: typeof settings.channelId === 'string' ? settings.channelId : ''
    };
}

function saveLevelSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].levelSettings = { ...getLevelSettings(guildId), ...updates };
    saveConfigsToFile();
    return getLevelSettings(guildId);
}

function getTopLevelsSettings(guildId) {
    const settings = (savedConfigs[guildId] || {}).topLevelsSettings || {};
    const normalizeColor = (value, fallback) => {
        const color = String(value || '').replace(/^#/, '');
        return /^[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : fallback;
    };
    return {
        backgroundImage: typeof settings.backgroundImage === 'string' ? settings.backgroundImage : '',
        backgroundColor: normalizeColor(settings.backgroundColor, '141A24'),
        rowColor: normalizeColor(settings.rowColor, '222B3A'),
        borderColor: normalizeColor(settings.borderColor, '67D8C0'),
        textColor: normalizeColor(settings.textColor, 'F3F5F7')
    };
}

function saveTopLevelsSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].topLevelsSettings = { ...getTopLevelsSettings(guildId), ...updates };
    saveConfigsToFile();
    return getTopLevelsSettings(guildId);
}

function getQuestLeaderboardSettings(guildId) {
    const settings = (savedConfigs[guildId] || {}).questLeaderboardSettings || {};
    const normalizeColor = (value, fallback) => {
        const color = String(value || '').replace(/^#/, '');
        return /^[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : fallback;
    };
    return {
        backgroundImage: typeof settings.backgroundImage === 'string' ? settings.backgroundImage : '',
        backgroundColor: normalizeColor(settings.backgroundColor, '111A19'),
        rowColor: normalizeColor(settings.rowColor, '26312E'),
        borderColor: normalizeColor(settings.borderColor, 'D9AA61'),
        textColor: normalizeColor(settings.textColor, 'F4F0E7')
    };
}

function saveQuestLeaderboardSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].questLeaderboardSettings = { ...getQuestLeaderboardSettings(guildId), ...updates };
    saveConfigsToFile();
    return getQuestLeaderboardSettings(guildId);
}

function loadLevelsData() {
    if (!fs.existsSync(LEVELS_FILE)) {
        const legacyFile = path.resolve(process.cwd(), 'levelsData.json');
        if (legacyFile !== LEVELS_FILE && fs.existsSync(legacyFile)) {
            const legacyData = readLevelsDataFile(legacyFile);
            saveLevelsData(legacyData);
            console.warn(`Données de niveaux migrées depuis le dossier de lancement vers ${LEVELS_FILE}.`);
            return legacyData;
        }
        return {};
    }
    return readLevelsDataFile(LEVELS_FILE);
}

function readLevelsDataFile(filePath) {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        throw new Error(`Impossible de lire les données de niveaux dans ${filePath}; aucune donnée ne sera remplacée.`, { cause: err });
    }

    validateLevelsData(data, filePath);
    return data;
}

function validateLevelsData(data, filePath) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new TypeError(`Le fichier de niveaux ${filePath} n’a pas une structure JSON valide; aucune donnée ne sera remplacée.`);
    }

    for (const [guildId, guildData] of Object.entries(data)) {
        if (!guildData || typeof guildData !== 'object' || Array.isArray(guildData)) {
            throw new TypeError(`Données de niveaux invalides pour le serveur ${guildId} dans ${filePath}; aucune donnée ne sera remplacée.`);
        }
        for (const [userId, record] of Object.entries(guildData)) {
            if (!record || typeof record !== 'object' || Array.isArray(record) ||
                typeof record.xp !== 'number' || !Number.isFinite(record.xp) || record.xp < 0) {
                throw new TypeError(`Données XP invalides pour le membre ${userId} dans ${filePath}; aucune donnée ne sera remplacée.`);
            }
        }
    }
}

function saveLevelsData(data) {
    validateLevelsData(data, LEVELS_FILE);
    const serializedData = JSON.stringify(data, null, 2);
    if (typeof serializedData !== 'string') {
        throw new TypeError('Les données de niveaux ne peuvent pas être sérialisées; le fichier existant est conservé.');
    }

    if (fs.existsSync(LEVELS_FILE)) {
        readLevelsDataFile(LEVELS_FILE);
        fs.copyFileSync(LEVELS_FILE, LEVELS_BACKUP_FILE);
    }

    const tempFile = `${LEVELS_FILE}.${process.pid}.${Date.now()}.tmp`;
    try {
        fs.writeFileSync(tempFile, serializedData, { flag: 'wx' });
        fs.renameSync(tempFile, LEVELS_FILE);
    } catch (err) {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        throw new Error(`Impossible de sauvegarder les données de niveaux dans ${LEVELS_FILE}; le fichier existant est conservé.`, { cause: err });
    }
}

function xpForNextLevel(level) {
    return 100 + level * 50;
}

function getLevelProgress(totalXp) {
    let remainingXp = Math.max(0, Number(totalXp) || 0);
    let level = 0;
    let requiredXp = xpForNextLevel(level);
    while (remainingXp >= requiredXp) {
        remainingXp -= requiredXp;
        level += 1;
        requiredXp = xpForNextLevel(level);
    }
    return { level, currentXp: remainingXp, requiredXp };
}

function totalXpForLevel(level) {
    return 25 * level * (level + 3);
}

function getLevelRank(guildId, userId) {
    const guildData = loadLevelsData()[guildId] || {};
    const rankedUsers = Object.entries(guildData)
        .map(([entryUserId, record]) => ({
            userId: entryUserId,
            xp: Math.max(0, Number(record?.xp) || 0),
            ...getLevelProgress(record?.xp)
        }))
        .sort((left, right) => right.level - left.level || right.currentXp - left.currentXp);
    const rank = rankedUsers.findIndex(entry => entry.userId === userId);
    return rank < 0 ? rankedUsers.length + 1 : rank + 1;
}

function getCanvasDisplayName(user) {
    const displayName = user.globalName || user.username;
    return /[\p{S}\p{Extended_Pictographic}]/u.test(displayName) ? user.username : displayName;
}

async function loadCanvasImage(url) {
    if (!url) return null;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) return null;
        const contentLength = Number(response.headers.get('content-length')) || 0;
        if (contentLength > 8 * 1024 * 1024) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 8 * 1024 * 1024) return null;
        return await loadImage(buffer);
    } catch {
        return null;
    }
}

async function createLevelCardImage({ user, displayName, rank, level, totalXp, settings }) {
    const width = 1200;
    const height = 300;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const [red, green, blue] = settings.color.match(/.{2}/g).map(value => parseInt(value, 16));
    const accent = `rgba(${red}, ${green}, ${blue}, 0.78)`;

    context.save();
    context.beginPath();
    context.roundRect(0, 0, width, height, 22);
    context.clip();

    const backgroundImage = await loadCanvasImage(settings.imageUrl);
    if (backgroundImage) {
        const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
        const imageWidth = backgroundImage.width * scale;
        const imageHeight = backgroundImage.height * scale;
        context.drawImage(backgroundImage, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
        context.fillStyle = 'rgba(35, 12, 27, 0.46)';
        context.fillRect(0, 0, width, height);
    } else {
        const background = context.createLinearGradient(0, 0, width, height);
        background.addColorStop(0, '#f4b9cd');
        background.addColorStop(0.48, '#b86c91');
        background.addColorStop(1, '#51213f');
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
    }

    context.strokeStyle = 'rgba(255, 239, 247, 0.16)';
    context.lineWidth = 2;
    for (let index = 0; index < 9; index += 1) {
        context.beginPath();
        context.moveTo(580 + index * 36, -30);
        context.bezierCurveTo(780 + index * 24, 65, 780 - index * 18, 170, 1150 + index * 24, 330);
        context.stroke();
    }

    const avatarX = 48;
    const avatarY = 60;
    const avatarSize = 174;
    context.fillStyle = 'rgba(25, 12, 22, 0.42)';
    context.beginPath();
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 7, 0, Math.PI * 2);
    context.fill();
    context.save();
    context.beginPath();
    context.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    context.clip();
    const avatar = await loadCanvasImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    if (avatar) {
        context.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        context.filter = 'none';
    } else {
        context.fillStyle = 'rgba(35, 12, 27, 0.55)';
        context.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    }
    context.restore();

    context.fillStyle = 'rgba(255, 247, 251, 0.88)';
    context.font = '700 34px sans-serif';
    context.fillText(`RANG : #${rank}`, 260, 94, 460);
    context.textAlign = 'right';
    context.font = '600 28px sans-serif';
    context.fillText(`NIVEAU : ${level}`, 1140, 94, 370);
    context.textAlign = 'left';

    context.fillStyle = '#ffffff';
    context.font = '700 38px sans-serif';
    context.fillText(displayName.slice(0, 30), 260, 151, 740);

    const progress = getLevelProgress(totalXp);
    const progressRatio = progress.requiredXp > 0 ? progress.currentXp / progress.requiredXp : 0;
    context.fillStyle = 'rgba(255, 238, 247, 0.88)';
    context.font = '600 19px sans-serif';
    context.fillText(`${progress.currentXp.toLocaleString('fr-FR')} / ${progress.requiredXp.toLocaleString('fr-FR')} XP`, 260, 190);
    context.textAlign = 'right';
    context.fillText(`${totalXp.toLocaleString('fr-FR')} XP au total`, 1140, 190);
    context.textAlign = 'left';

    fillRoundedRect(context, 260, 211, 880, 28, 14, 'rgba(36, 13, 29, 0.48)');
    if (progressRatio > 0) {
        fillRoundedRect(context, 260, 211, Math.max(28, 880 * progressRatio), 28, 14, accent);
    }
    const caption = settings.title
        .replaceAll('{user}', displayName)
        .replaceAll('{level}', String(level));
    context.fillStyle = '#fff8fb';
    context.font = '700 16px sans-serif';
    context.fillText(caption, 260, 274, 700);
    context.textAlign = 'right';
    context.fillStyle = 'rgba(255, 238, 247, 0.82)';
    context.font = '500 16px sans-serif';
    context.fillText('BMF  •  LEVELS', 1140, 274);
    context.restore();

    return canvas.toBuffer('image/png');
}

async function createTopLevelsImage(entries, userRank, settings) {
    const width = 1200;
    const rowHeight = 64;
    const rowGap = 12;
    const listTop = 222;
    const visibleRows = Math.max(entries.length, 1);
    const height = Math.max(450, listTop + visibleRows * (rowHeight + rowGap) + 100);
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    const { backgroundColor, rowColor, borderColor, textColor } = settings;

    context.save();
    context.beginPath();
    context.roundRect(0, 0, width, height, 24);
    context.clip();

    context.fillStyle = `#${backgroundColor}`;
    context.fillRect(0, 0, width, height);
    const backgroundImage = await loadCanvasImage(settings.backgroundImage);
    if (backgroundImage) {
        const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
        const imageWidth = backgroundImage.width * scale;
        const imageHeight = backgroundImage.height * scale;
        context.drawImage(backgroundImage, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
        context.fillStyle = hexToRgba(backgroundColor, 0.58);
        context.fillRect(0, 0, width, height);
    }

    context.fillStyle = `#${borderColor}`;
    context.fillRect(64, 48, 7, 114);
    context.font = '600 18px sans-serif';
    context.fillText('BMF  /  LEVELS', 92, 74);
    context.fillStyle = `#${textColor}`;
    context.font = '700 52px sans-serif';
    context.fillText('TOP LEVELS', 88, 132);
    context.font = '400 21px sans-serif';
    context.fillText('Les membres les plus avancés du serveur', 92, 168);

    context.fillStyle = hexToRgba(borderColor, 0.9);
    context.font = '600 15px sans-serif';
    context.fillText('RANG', 94, 204);
    context.fillText('MEMBRE', 190, 204);
    context.textAlign = 'right';
    context.fillText('NIVEAU  /  XP', 1108, 204);
    context.textAlign = 'left';

    if (!entries.length) {
        fillRoundedRect(context, 76, listTop, 1048, rowHeight, 14, `#${rowColor}`, `#${borderColor}`);
        context.fillStyle = `#${textColor}`;
        context.font = '500 21px sans-serif';
        context.fillText('Personne n’a encore gagné d’XP.', 102, listTop + 40, 990);
    }

    entries.forEach((entry, index) => {
        const y = listTop + index * (rowHeight + rowGap);
        fillRoundedRect(context, 76, y, 1048, rowHeight, 14, `#${rowColor}`, `#${borderColor}`);
        fillRoundedRect(context, 76, y, 6, rowHeight, 3, `#${borderColor}`);
        context.fillStyle = `#${borderColor}`;
        context.font = '700 24px sans-serif';
        context.fillText(String(index + 1).padStart(2, '0'), 101, y + 41);
        context.fillStyle = `#${textColor}`;
        context.font = '600 23px sans-serif';
        context.fillText(String(entry.displayName || 'Utilisateur inconnu').slice(0, 34), 190, y + 40, 570);
        context.textAlign = 'right';
        context.font = '700 19px sans-serif';
        context.fillText(`NIVEAU ${entry.level}  •  ${entry.xp.toLocaleString('fr-FR')} XP`, 1098, y + 39, 330);
        context.textAlign = 'left';
    });

    const footerY = listTop + visibleRows * (rowHeight + rowGap) + 28;
    context.strokeStyle = hexToRgba(borderColor, 0.5);
    context.beginPath();
    context.moveTo(84, footerY - 16);
    context.lineTo(1116, footerY - 16);
    context.stroke();
    context.fillStyle = `#${textColor}`;
    context.font = '500 18px sans-serif';
    context.fillText(`TON RANG  #${userRank || 'N/A'}`, 92, footerY + 18);
    context.restore();

    return canvas.toBuffer('image/png');
}

function getLevelRecord(data, guildId, userId) {
    if (!data[guildId] || typeof data[guildId] !== 'object') data[guildId] = {};
    const record = data[guildId][userId] || { xp: 0 };
    record.xp = Math.max(0, Number(record.xp) || 0);
    data[guildId][userId] = record;
    return record;
}

function addLevelXp(guildId, userId, amount) {
    const data = loadLevelsData();
    const record = getLevelRecord(data, guildId, userId);
    const oldLevel = getLevelProgress(record.xp).level;
    record.xp += Math.max(0, Math.floor(Number(amount) || 0));
    const newLevel = getLevelProgress(record.xp).level;
    saveLevelsData(data);
    return { record, oldLevel, newLevel };
}

async function grantLevelRewards(guild, userId, oldLevel, newLevel) {
    if (newLevel <= oldLevel) return;
    const rewards = getLevelSettings(guild.id).rewards.filter(reward => reward.level > oldLevel && reward.level <= newLevel);
    if (!rewards.length) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    for (const reward of rewards) {
        const role = await guild.roles.fetch(reward.roleId).catch(() => null);
        if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role).catch(err => console.error(`Impossible d’attribuer le rôle de niveau ${role.name} :`, err));
        }
    }
}

async function sendLevelUpAnnouncement(guild, user, displayName, oldLevel, newLevel, totalXp) {
    const settings = getLevelSettings(guild.id);
    if (!settings.enabled || !settings.channelId || newLevel <= oldLevel) return;

    const channel = await guild.channels.fetch(settings.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const rank = getLevelRank(guild.id, user.id);
    const image = await createLevelCardImage({ user, displayName: getCanvasDisplayName(user) || displayName, rank, level: newLevel, totalXp, settings });
    const fileName = `level-${user.id}.png`;
    const attachment = new AttachmentBuilder(image, { name: fileName });
    await channel.send({ content: `${user}`, files: [attachment] }).catch(() => {});
}

async function awardMessageXp(message) {
    const settings = getLevelSettings(message.guild.id);
    if (!settings.enabled) return;

    const cooldownKey = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const lastAwardAt = levelMessageCooldown.get(cooldownKey) || 0;
    if (now - lastAwardAt < settings.cooldownSeconds * 1000) return;

    levelMessageCooldown.set(cooldownKey, now);
    const { record, oldLevel, newLevel } = addLevelXp(message.guild.id, message.author.id, settings.xpPerMessage);
    if (newLevel > oldLevel) {
        const memberName = message.member?.displayName || message.author.globalName || message.author.username;
        await grantLevelRewards(message.guild, message.author.id, oldLevel, newLevel);
        await sendLevelUpAnnouncement(message.guild, message.author, memberName, oldLevel, newLevel, record.xp);
    }
}

async function awardLevelVoiceSession(guild, userId, session, endingChannelId = null, voiceState = null) {
    const settings = getLevelSettings(guild.id);
    if (!settings.enabled || !session?.qualified || session.processing) return;

    const now = Date.now();
    const intervalMs = settings.voiceIntervalSeconds * 1000;
    try {
        const member = guild.members.cache.get(userId) || await guild.members.fetch(userId).catch(() => null);
        if (!member) return;
        const activeVoiceState = voiceState || member.voice;
        session.lastAwardAt = Number(session.lastAwardAt) || now;
        if (activeVoiceState.selfMute || activeVoiceState.serverMute) {
            session.lastAwardAt = now;
            return;
        }

        session.elapsedMs = Math.max(0, Number(session.elapsedMs) || 0) + Math.max(0, now - session.lastAwardAt);
        session.lastAwardAt = now;
        const intervals = Math.floor(session.elapsedMs / intervalMs);
        if (intervals <= 0) return;

        const channelId = endingChannelId || activeVoiceState.channelId;
        const channel = channelId ? guild.channels.cache.get(channelId) : null;
        const activeMembers = (channel?.members.filter(channelMember => !channelMember.user.bot).size || 0) +
            (endingChannelId && activeVoiceState.channelId !== endingChannelId ? 1 : 0);
        if (!channel || channel.id !== session.channelId || activeMembers < settings.minimumVoiceMembers) {
            session.elapsedMs = 0;
            return;
        }
        session.elapsedMs -= intervals * intervalMs;
        session.processing = true;
        const xpGained = intervals * settings.voiceXpPerInterval;
        const { record, oldLevel, newLevel } = addLevelXp(guild.id, userId, xpGained);
        await grantLevelRewards(guild, userId, oldLevel, newLevel);
        await sendLevelUpAnnouncement(
            guild,
            member.user,
            getCanvasDisplayName(member.user),
            oldLevel,
            newLevel,
            record.xp
        );
    } finally {
        session.processing = false;
    }
}

async function awardLevelVoiceState(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;

    const guild = newState.guild;
    const key = getVoiceQuestKey(member.id, guild.id);
    const settings = getLevelSettings(guild.id);
    if (!settings.enabled) {
        levelVoiceStart.delete(key);
        return;
    }

    const hasLeftOrChanged = oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId);
    const muteChanged = oldState.selfMute !== newState.selfMute || oldState.serverMute !== newState.serverMute;
    const session = levelVoiceStart.get(key);
    if (session && (hasLeftOrChanged || muteChanged)) {
        await awardLevelVoiceSession(guild, member.id, session, oldState.channelId || null, oldState);
        session.lastAwardAt = Date.now();
    }

    if (hasLeftOrChanged) {
        levelVoiceStart.delete(key);
    }

    const hasJoinedOrChanged = newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId);
    if (hasJoinedOrChanged) {
        const channel = newState.channel;
        const activeMembers = channel?.members.filter(channelMember => !channelMember.user.bot).size || 0;
        const qualified = activeMembers >= settings.minimumVoiceMembers;
        if (qualified && channel) {
            for (const channelMember of channel.members.values()) {
                const existingSession = levelVoiceStart.get(getVoiceQuestKey(channelMember.id, guild.id));
                if (existingSession && !existingSession.qualified) {
                    existingSession.qualified = true;
                    existingSession.lastAwardAt = Date.now();
                    existingSession.elapsedMs = 0;
                    existingSession.channelId = channel.id;
                }
            }
        }
        levelVoiceStart.set(key, {
            lastAwardAt: Date.now(),
            elapsedMs: 0,
            channelId: channel?.id,
            qualified
        });
    }
}

function refreshLevelVoiceSessions(guild) {
    const prefix = `${guild.id}:`;
    for (const key of levelVoiceStart.keys()) {
        if (key.startsWith(prefix)) levelVoiceStart.delete(key);
    }

    const settings = getLevelSettings(guild.id);
    if (!settings.enabled) return;

    for (const channel of guild.channels.cache.values()) {
        if (!channel.isVoiceBased()) continue;
        const members = [...channel.members.values()].filter(member => !member.user.bot);
        const qualified = members.length >= settings.minimumVoiceMembers;
        for (const member of members) {
            levelVoiceStart.set(getVoiceQuestKey(member.id, guild.id), {
                lastAwardAt: Date.now(),
                elapsedMs: 0,
                channelId: channel.id,
                qualified
            });
        }
    }
}

function areNormalQuestsEnabled(guildId) {
    return (savedConfigs[guildId] || {}).normalQuestsEnabled !== false;
}

async function getNormalQuestChannel(guild) {
    const channelId = savedConfigs[guild.id]?.questChannelId;
    if (!channelId) {
        console.warn(`Aucun salon normal de quêtes n’est configuré pour le serveur ${guild.id}.`);
        return null;
    }
    const channel = await guild.channels.fetch(channelId).catch(err => {
        console.error(`Impossible de récupérer le salon normal de quêtes ${channelId} :`, err);
        return null;
    });
    if (!channel?.isTextBased() || !channel.isSendable()) {
        console.error(`Le salon normal de quêtes ${channelId} est introuvable ou ne permet pas l’envoi de messages.`);
        return null;
    }
    return channel;
}

async function sendNormalQuestMessage(guild, payload) {
    const channel = await getNormalQuestChannel(guild);
    if (!channel) return false;
    try {
        await channel.send(payload);
        return true;
    } catch (err) {
        console.error(`Impossible d’envoyer un message dans le salon normal de quêtes ${channel.id} :`, err);
        return false;
    }
}

function buildQuestOwnerButtons(userId, { start = false, proof = false } = {}) {
    const buttons = [];
    if (start) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`quest_start_${userId}`)
            .setLabel('✅ Commencer')
            .setStyle(ButtonStyle.Success));
    }
    if (proof) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`quest_send_proof_${userId}`)
            .setLabel('Preuve')
            .setStyle(ButtonStyle.Success));
    }
    if (!start) {
        buttons.push(new ButtonBuilder()
            .setCustomId(`quest_continue_${userId}`)
            .setLabel('➡️ Voir ma quête')
            .setStyle(ButtonStyle.Primary));
    }
    buttons.push(new ButtonBuilder()
        .setCustomId(`quest_later_${userId}`)
        .setLabel('⏰ Plus tard')
        .setStyle(ButtonStyle.Secondary));
    return new ActionRowBuilder().addComponents(buttons);
}

function getQuestButtonOwnerId(customId, action) {
    const match = customId.match(new RegExp(`^quest_${action}_(\\d+)$`));
    return match?.[1] || null;
}

function buildNormalQuestProgressEmbed(user, state, guildQuests) {
    const memberDisplay = user.globalName || user.username;
    const currentQuest = guildQuests[state.currentQuest] || {
        title: 'Quêtes terminées',
        description: 'Tu as terminé toutes les quêtes disponibles.',
        goal: 100,
        reward: 'Récompense finale / giveaway staff'
    };
    const hybridGoals = currentQuest.type === 'hybrid' ? getHybridQuestGoals(currentQuest) : null;
    const progressLabel = currentQuest.type === 'voice'
        ? `${formatQuestProgress(currentQuest, state.progress)} / ${currentQuest.goal} min`
        : currentQuest.type === 'hybrid'
            ? `${Math.max(0, Number(state.messageCount || 0))} / ${hybridGoals.messageGoal} messages • ${Math.floor(Number(state.voiceSeconds || 0) / 60)} / ${Math.floor((hybridGoals.voiceSecondsGoal || 0) / 60)} min`
            : `${state.progress} / ${currentQuest.goal} ${currentQuest.type === 'reaction' ? 'réactions' : currentQuest.type === 'invite' ? 'invitations' : currentQuest.type === 'manual' ? 'validations' : 'messages'}`;
    const proofText = isProofQuest(currentQuest)
        ? '\n\n📌 Pour valider cette quête, envoie ta preuve dans le salon configuré pour les preuves, puis utilise le bouton ci-dessous.'
        : '';
    return new EmbedBuilder()
        .setTitle(`📜 Quête actuelle - Niveau ${state.currentQuest} • ${memberDisplay}`)
        .setDescription(`**Membre :** ${user}\n**${currentQuest.title}**\n${currentQuest.description}${proofText}\n\n**Progression :** ${progressLabel}\n\n**Récompense :** ${getQuestRewardDisplay(currentQuest)}`)
        .setColor(0x8B3A3A);
}

const CONFIG_CATEGORIES = {
    logs: {
        title: 'Logs',
        description: 'Choisis un salon par défaut, puis sélectionne les modules dont tu veux journaliser les commandes.'
    },
    admin: {
        title: 'Administration',
        description: '`/admin` : ouvrir directement ce panneau de réglages\n`/config` : ouvrir le panneau général\n`/setlogs` : choisir le salon des logs généraux\n`/setcommandlogs` : choisir le salon des commandes exécutées\n`/invitelogs` : gérer les logs d’invitations\n`/logquest` : configurer les logs de quêtes\n`/setproof` : choisir le salon des preuves\n`/setspecialquest` : configurer le salon des quêtes spéciales\n`/quetes` : activer ou désactiver les quêtes normales\n`/quetespeciales` : gérer les quêtes spéciales\n`/dropadmin` : offrir de l’XP ou des niveaux\n`/dropjetons` : lancer un cadeau manuel de jetons\n`/setdropjetons` : choisir ou désactiver le salon des cadeaux automatiques\n`/resetroulette` : réinitialiser les tours d’un membre\n\nDans **Jetons**, tu peux aussi modifier le prix des tours, la limite d’achat et les récompenses quotidiennes.'
    },
    fun: {
        title: 'Fun',
        description: '`/roulette` : tenter ta chance à la roulette hebdomadaire\n`/soldejetons` : consulter ton solde de jetons\n`/quotidien` : récupérer ta récompense quotidienne et faire progresser ta série\n`/boutique` : acheter des tours avec tes jetons\n`/level` : consulter un niveau\n`/toplevel` : voir le classement des niveaux'
    },
    quests: {
        title: 'Quêtes',
        description: '`/quest` : voir ou démarrer ton parcours\n`/questlist` : consulter les objectifs et récompenses\n`/topquetes` : afficher le classement des quêtes\n`/validermanuel` : valider une quête manuelle\n`/passerquete` : faire avancer un membre\n`/resetquest` : remettre à zéro les progressions\n\nLes messages de progression et de validation des quêtes normales sont publiés dans le salon sélectionné ci-dessous.'
    },
    roulette: {
        title: 'Roulette',
        description: '`/roulette` : lancer un tour, dans la limite hebdomadaire configurée.\n`/boutique` : acheter des tours supplémentaires au prix configuré dans Administration → Jetons.\n`/quotidien` : gagner des jetons chaque jour. Les cadeaux sont disponibles via `/dropjetons`.'
    },
    levels: {
        title: 'Niveaux',
        description: '`/level` : consulter son niveau ou celui d’un membre\n`/toplevel` : voir le top 10 du serveur\n`/dropadmin` : ajouter de l’XP ou des niveaux à un membre\n\nLes gains automatiques sont ralentis : 10 XP toutes les 2 minutes en messages et 10 XP toutes les 5 minutes en vocal. Le temps passé avec le micro coupé (muet personnel ou par le serveur) ne rapporte pas d’XP vocal.'
    },
    tickets: {
        title: 'Tickets',
        description: 'Clique sur **Créer un panneau de tickets** pour ouvrir le constructeur. Les membres choisissent ensuite un motif pour ouvrir un ticket ; le staff peut le prendre en charge et le fermer.'
    }
};

const ADMIN_CONFIG_PAGES = {
    logs: { title: 'Salon des logs généraux', description: 'Les événements généraux du bot seront envoyés dans ce salon.', channelId: 'logChannelId' },
    commandlogs: { title: 'Salon des commandes', description: 'Chaque commande slash exécutée sera journalisée séparément des invitations.', channelId: 'commandLogChannelId' },
    invites: { title: 'Logs des invitations', description: 'Choisis le salon des arrivées par invitation et active ou désactive leur journalisation.', channelId: 'inviteLogChannelId' },
    questlogs: { title: 'Logs des quêtes', description: 'Choisis le salon des validations de quêtes et le rôle mentionné.', channelId: 'questLogChannelId' },
    proof: { title: 'Salon des preuves', description: 'Les preuves envoyées pour les quêtes manuelles seront dirigées vers ce salon.', channelId: 'proofChannelId' },
    specialquest: { title: 'Quêtes spéciales', description: 'Choisis où les quêtes spéciales apparaissent et quel rôle est mentionné.', channelId: 'specialQuestChannelId' },
    specialquests: { title: 'Apparitions spéciales', description: 'Active/désactive les apparitions automatiques ou lance une quête disponible maintenant.' },
    normalquests: { title: 'Quêtes normales', description: 'Active ou mets en pause le parcours normal du serveur.' },
    validatorrole: { title: 'Rôles validateurs', description: 'Choisis les rôles autorisés à valider les quêtes manuelles.' },
    rankup: { title: 'Annonces Rankup', description: 'Configure les annonces automatiques envoyées quand un membre reçoit le rôle Test BMF ou Membre BMF.', channelId: 'rankupAnnouncementChannelId' },
    tokens: { title: 'Jetons et boutique', description: 'Configure les prix et récompenses de l’économie de jetons. Les commandes membres sont `/soldejetons`, `/quotidien` et `/boutique` ; les commandes de gestion sont `/dropjetons`, `/setdropjetons` et `/resetroulette`.', channelId: 'tokenDropChannelId' }
};

const BOT_LOG_MODULES = {
    moderation: { label: 'Modération', commands: ['ban', 'unban', 'kick', 'warn', 'tempmute', 'unmute', 'rankup', 'derank'] },
    administration: { label: 'Administration', commands: ['admin', 'config', 'setlogs', 'setcommandlogs', 'invitelogs', 'logquest', 'setproof', 'setspecialquest', 'setquestvalidatorrole', 'quete', 'quetes', 'quetespeciales', 'resetquest', 'dropjetons', 'setdropjetons'] },
    levels: { label: 'Levels', commands: ['level', 'toplevel', 'dropadmin'] },
    quests: { label: 'Quêtes', commands: ['quest', 'questlist', 'topquetes', 'validermanuel', 'passerquete'] },
    roulette: { label: 'Roulette', commands: ['roulette', 'spin', 'boutique', 'quotidien', 'soldejetons', 'resetroulette'] },
    tickets: { label: 'Tickets', commands: ['embed', 'editembed'] },
    roblox: { label: 'Roblox', commands: ['linkroblox', 'roblox', 'unlinkroblox'] },
    messages: { label: 'Commandes diverses', commands: ['send', 'userinfo', 'clear'] },
    deletedMessages: { label: 'Messages supprimés', commands: [] }
};

function getBotLogSettings(guildId) {
    const guildConfig = savedConfigs[guildId] || {};
    const raw = guildConfig.commandLogging || {};
    const modules = {};
    for (const key of Object.keys(BOT_LOG_MODULES)) {
        const moduleSettings = raw.modules?.[key] || {};
        modules[key] = {
            enabled: key === 'deletedMessages' ? moduleSettings.enabled === true : moduleSettings.enabled !== false,
            channelId: typeof moduleSettings.channelId === 'string' ? moduleSettings.channelId : '',
            color: /^[0-9a-fA-F]{6}$/.test(String(moduleSettings.color || '')) ? moduleSettings.color.toUpperCase() : 'E17755',
            avatarUrl: typeof moduleSettings.avatarUrl === 'string' ? moduleSettings.avatarUrl : ''
        };
    }
    return {
        enabled: raw.enabled !== false,
        defaultChannelId: raw.defaultChannelId || guildConfig.commandLogChannelId || '',
        modules
    };
}

function saveBotLogSettings(guildId, updates) {
    if (!savedConfigs[guildId]) savedConfigs[guildId] = {};
    savedConfigs[guildId].commandLogging = { ...getBotLogSettings(guildId), ...updates };
    saveConfigsToFile();
    return getBotLogSettings(guildId);
}

function getCommandLogModule(commandName) {
    return Object.entries(BOT_LOG_MODULES).find(([, module]) => module.commands.includes(commandName))?.[0] || 'messages';
}

function buildConfigCategoryRow(category) {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('config_category_select')
            .setPlaceholder(category === 'home' ? 'Accueil' : `Rubrique : ${CONFIG_CATEGORIES[category]?.title || 'Administration'}`)
            .addOptions(
                { label: 'Accueil', value: 'home', description: 'Présentation du panneau de configuration' },
                { label: 'Logs', value: 'logs', description: 'Choisir les modules et salons de journalisation' },
                { label: 'Administration', value: 'admin', description: 'Logs, rôles et réglages du serveur' },
                { label: 'Fun', value: 'fun', description: 'Commandes de divertissement' },
                { label: 'Quêtes', value: 'quests', description: 'Parcours, validations et classements' },
                { label: 'Roulette', value: 'roulette', description: 'Tours et récompenses' },
                { label: 'Levels', value: 'levels', description: 'XP, niveaux et récompenses de rôles' },
                { label: 'Tickets', value: 'tickets', description: 'Panneaux de tickets et support' }
            )
    );
}

function buildConfigPanelEmbed(category, guildId) {
    if (category.startsWith('questManager_')) {
        const pageNumber = Math.max(0, Number(category.slice('questManager_'.length)) || 0);
        const quests = getNormalQuestsConfig(guildId);
        const entries = Object.entries(quests).slice(
            pageNumber * QUEST_MANAGER_PAGE_SIZE,
            (pageNumber + 1) * QUEST_MANAGER_PAGE_SIZE
        );
        const lines = entries.map(([number, quest]) =>
            `**${number}. ${quest.title}** · ${quest.type} · ${quest.goal}${quest.type === 'voice' ? ' min' : ''} · ${quest.reward.slice(0, 100)}`
        );
        return new EmbedBuilder()
            .setTitle('📝 Administration • Quêtes normales')
            .setDescription(`${lines.join('\n') || 'Aucune quête sur cette page.'}\n\nPage ${pageNumber + 1} · ${Object.keys(quests).length} quête(s) au total.\nL’XP est attribuée automatiquement si le système Levels est actif. Choisis un rôle sur la fiche. Les jetons, IG et objets sont à remettre manuellement.`)
            .setColor(0x8B3A3A);
    }

    if (category.startsWith('questEditor_')) {
        const questNumber = Number(category.slice('questEditor_'.length));
        const quest = getNormalQuestsConfig(guildId)[questNumber];
        if (!quest) {
            return new EmbedBuilder()
                .setTitle('📝 Quête introuvable')
                .setDescription('Cette quête a été supprimée ou n’existe plus.')
                .setColor(0x8B3A3A);
        }
        return new EmbedBuilder()
            .setTitle(`📝 Modifier la quête ${questNumber} • ${quest.title}`)
            .setDescription(`Type : **${quest.type}**\nObjectif : **${quest.goal}${quest.type === 'voice' ? ' min' : ''}**\nDescription : ${quest.description}\nRécompense : ${quest.reward}\nRôle automatique : ${quest.roleId ? `<@&${quest.roleId}>` : 'aucun'}\n\nTu peux modifier le texte, le type et l’objectif, choisir un rôle, ou supprimer cette quête.`)
            .setColor(0x8B3A3A);
    }

    if (category === 'home') {
        return new EmbedBuilder()
            .setTitle('⚙️ Configuration du bot')
            .setDescription('Bienvenue dans le panneau de configuration. Choisis une rubrique dans le menu ci-dessous pour retrouver les commandes et réglages correspondants.')
            .addFields(
                { name: 'Logs', value: 'Modules, salons de destination, activation et apparence des journaux.', inline: true },
                { name: 'Administration', value: 'Logs, preuves, permissions et réglages du serveur.', inline: true },
                { name: 'Fun', value: 'Commandes de divertissement et profils.', inline: true },
                { name: 'Quêtes', value: 'Parcours, objectifs et validations.', inline: true },
                { name: 'Roulette', value: 'Tours et récompenses hebdomadaires.', inline: true },
                { name: 'Levels', value: 'XP, niveaux, classement et personnalisation.', inline: true },
                { name: 'Tickets', value: 'Panneaux, motifs et support des membres.', inline: true }
            )
            .setColor(0x26312E);
    }

    if (category === 'levelRewards') {
        const rewards = getLevelSettings(guildId).rewards.sort((left, right) => left.level - right.level);
        return new EmbedBuilder()
            .setTitle('⚙️ Levels • Récompenses')
            .setDescription(rewards.length
                ? `${rewards.map(reward => `Niveau **${reward.level}** → <@&${reward.roleId}>`).join('\n')}\n\nSélectionne un rôle pour modifier son niveau ou entre 0 pour retirer son association.`
                : 'Aucun rôle de niveau configuré. Sélectionne un rôle ci-dessous pour lui associer un niveau.')
            .setColor(0x26312E);
    }

    if (category === 'logs') {
        const settings = getBotLogSettings(guildId);
        const enabledModules = Object.entries(settings.modules)
            .filter(([, moduleSettings]) => moduleSettings.enabled)
            .map(([key]) => BOT_LOG_MODULES[key].label);
        return new EmbedBuilder()
            .setTitle('📋 Configuration • Logs')
            .setDescription('Configure les commandes à journaliser et leur destination.')
            .addFields(
                { name: 'Système', value: `**${settings.enabled ? 'activé' : 'désactivé'}**`, inline: true },
                { name: 'Salon par défaut', value: settings.defaultChannelId ? `<#${settings.defaultChannelId}>` : 'Non configuré', inline: true },
                { name: 'Modules actifs', value: enabledModules.length ? enabledModules.join(', ') : 'Aucun', inline: false }
            )
            .setColor(0xE17755);
    }

    if (category === 'logModules') {
        const settings = getBotLogSettings(guildId);
        const lines = Object.entries(BOT_LOG_MODULES).map(([key, module]) => {
            const moduleSettings = settings.modules[key];
            const destination = moduleSettings.channelId || settings.defaultChannelId;
            return `${moduleSettings.enabled ? '✅' : '❌'} **${module.label}**${destination ? ` → <#${destination}>` : ' → aucun salon'}`;
        });
        return new EmbedBuilder()
            .setTitle('📋 Configuration • Modules')
            .setDescription(`${lines.join('\n')}\n\nChoisis un module dans le menu pour modifier son statut et son salon.`)
            .setColor(0xE17755);
    }

    if (category.startsWith('logModule_')) {
        const key = category.slice('logModule_'.length);
        const module = BOT_LOG_MODULES[key];
        if (module) {
            const settings = getBotLogSettings(guildId);
            const moduleSettings = settings.modules[key];
            const destination = moduleSettings.channelId || settings.defaultChannelId;
            const trackedItems = key === 'deletedMessages'
                ? 'Événement suivi : suppression d’un message (texte et pièces jointes disponibles).'
                : `Commandes suivies : ${module.commands.map(command => `/${command}`).join(', ')}`;
            return new EmbedBuilder()
                .setTitle(`📋 Logs • ${module.label}`)
                .setDescription(`${trackedItems}\n\nStatut : **${moduleSettings.enabled ? 'activé' : 'désactivé'}**\nDestination : **${destination ? `<#${destination}>` : 'aucun salon configuré'}**${moduleSettings.channelId ? ' (salon personnalisé)' : ' (salon par défaut)'}\nCouleur : **#${moduleSettings.color}**\nAvatar : **${moduleSettings.avatarUrl ? 'personnalisé' : 'aucun'}**`)
                .setColor(parseInt(moduleSettings.color, 16))
                .setThumbnail(moduleSettings.avatarUrl || null);
        }
    }

    if (category === 'admin') {
        const config = savedConfigs[guildId] || {};
        const rankupSettings = getRankupAnnouncementSettings(guildId);
        return new EmbedBuilder()
            .setTitle('⚙️ Administration')
            .setDescription('Choisis un réglage ci-dessous. Chaque bouton ouvre directement ses options.')
            .addFields(
                { name: 'Logs', value: `Généraux : ${config.logChannelId ? `<#${config.logChannelId}>` : 'non configuré'}\nCommandes : ${config.commandLogChannelId ? `<#${config.commandLogChannelId}>` : 'non configuré'}\nInvitations : ${config.inviteLogChannelId ? `<#${config.inviteLogChannelId}>` : 'non configuré'}\nMessages supprimés : **${getBotLogSettings(guildId).modules.deletedMessages.enabled ? 'activés' : 'désactivés'}**`, inline: false },
                { name: 'Quêtes', value: `Normales : **${areNormalQuestsEnabled(guildId) ? 'activées' : 'désactivées'}**\nSalon des preuves : ${config.proofChannelId ? `<#${config.proofChannelId}>` : 'non configuré'}\nLogs : ${config.questLogChannelId ? `<#${config.questLogChannelId}>` : 'non configuré'}`, inline: false },
                { name: 'Spéciales', value: `Salon : ${config.specialQuestChannelId ? `<#${config.specialQuestChannelId}>` : 'non configuré'}\nRôle : ${config.specialQuestRoleId ? `<@&${config.specialQuestRoleId}>` : 'non configuré'}`, inline: false },
                { name: 'Jetons', value: `Cadeaux automatiques : ${config.tokenDropChannelId ? `<#${config.tokenDropChannelId}>` : 'désactivés'}\nBoutique : **${getTokenEconomySettings(guildId).spinCost} jetons / tour**`, inline: false },
                { name: 'Rankup', value: `Salon : ${rankupSettings.channelId ? `<#${rankupSettings.channelId}>` : 'non configuré'}\nRôle Test : ${rankupSettings.testRoleId ? `<@&${rankupSettings.testRoleId}>` : 'non configuré'}\nRôle Membre : ${rankupSettings.memberRoleId ? `<@&${rankupSettings.memberRoleId}>` : 'non configuré'}`, inline: false }
            )
            .setColor(0x26312E);
    }

    if (category.startsWith('admin_')) {
        const key = category.slice('admin_'.length);
        const page = ADMIN_CONFIG_PAGES[key];
        if (page) {
            const config = savedConfigs[guildId] || {};
            const rankupSettings = key === 'rankup' ? getRankupAnnouncementSettings(guildId) : null;
            const configuredChannel = key === 'rankup'
                ? rankupSettings.channelId
                : page.channelId ? config[page.channelId] : null;
            const details = key === 'tokens'
                ? (() => {
                    const settings = getTokenEconomySettings(guildId);
                    return `\n\nCommandes : \`/soldejetons\`, \`/quotidien\`, \`/boutique\`, \`/dropjetons\`, \`/setdropjetons\`, \`/resetroulette\`.\nPrix : **${settings.spinCost} jetons / tour** · Limite d’achat : **${settings.maxPaidSpins} tours par période**.\nQuotidien : **${settings.dailyBaseReward} jetons** au départ, **+${settings.dailyStreakStep}** par jour consécutif, plafond **${settings.dailyMaxReward}**.\nCadeaux automatiques : **${configuredChannel ? `<#${configuredChannel}>` : 'désactivés'}**.`
                })()
                : key === 'normalquests'
                ? `\n\nStatut actuel : **${areNormalQuestsEnabled(guildId) ? 'activées' : 'désactivées'}**.`
                : key === 'invites'
                    ? `\n\nStatut actuel : **${config.inviteLogsEnabled === false ? 'désactivé' : configuredChannel ? 'activé' : 'non configuré'}**.`
                    : configuredChannel ? `\n\nSalon actuel : <#${configuredChannel}>.` : '';
            const embed = new EmbedBuilder()
                .setTitle(`⚙️ Administration • ${page.title}`)
                .setDescription(`${page.description}${details}`)
                .setColor(0x26312E);
            if (key === 'questlogs' && config.questPingRoleId) {
                embed.addFields({ name: 'Rôle mentionné', value: `<@&${config.questPingRoleId}>`, inline: true });
            }
            if (key === 'specialquest' && config.specialQuestRoleId) {
                embed.addFields({ name: 'Rôle mentionné', value: `<@&${config.specialQuestRoleId}>`, inline: true });
            }
            if (key === 'rankup') {
                embed.addFields(
                    { name: 'Rôle déclencheur • nouveau test', value: rankupSettings.testRoleId ? `<@&${rankupSettings.testRoleId}>` : 'Non configuré', inline: true },
                    { name: 'Rôle déclencheur • test réussi', value: rankupSettings.memberRoleId ? `<@&${rankupSettings.memberRoleId}>` : 'Non configuré', inline: true },
                    { name: 'Rôle à mentionner', value: rankupSettings.pingRoleId ? `<@&${rankupSettings.pingRoleId}>` : 'Aucun', inline: true },
                    { name: 'Message nouveau test', value: rankupSettings.testMessage.slice(0, 1000), inline: false },
                    { name: 'Message test réussi', value: rankupSettings.memberMessage.slice(0, 1000), inline: false }
                );
            }
            return embed;
        }
    }

    const content = CONFIG_CATEGORIES[category] || CONFIG_CATEGORIES.home;
    const embed = new EmbedBuilder()
        .setTitle(`⚙️ ${content.title}`)
        .setDescription(content.description)
        .setColor(0x26312E);

    if (category === 'levels') {
        const settings = getLevelSettings(guildId);
        const topSettings = getTopLevelsSettings(guildId);
        const rewards = settings.rewards.length
            ? settings.rewards.map(reward => `Niveau **${reward.level}** → <@&${reward.roleId}>`).join('\n')
            : 'Aucun rôle de niveau configuré.';
        embed.addFields({
            name: 'Réglages actuels',
            value: `Système : **${settings.enabled ? 'activé' : 'désactivé'}**\nSalon des annonces : **${settings.channelId ? `<#${settings.channelId}>` : 'non configuré'}**\nXP message : **${settings.xpPerMessage}** tous les **${settings.cooldownSeconds} s**\nXP vocal : **${settings.voiceXpPerInterval}** tous les **${settings.voiceIntervalSeconds} s** (minimum **${settings.minimumVoiceMembers}** membre(s))\nImage : **${settings.imageUrl ? 'configurée' : 'aucune'}**\n\nRécompenses de niveau :\n${rewards}\n\nTop Levels : fond **${topSettings.backgroundImage ? 'image configurée' : `#${topSettings.backgroundColor}`}**, lignes **#${topSettings.rowColor}**, contours **#${topSettings.borderColor}**`,
            inline: false
        });
    }
    if (category === 'quests') {
        const settings = getQuestLeaderboardSettings(guildId);
        const specialData = loadSpecialQuestsData();
        const specialEnabled = getSpecialGuildState(specialData, guildId).enabled !== false;
        const questChannelId = savedConfigs[guildId]?.questChannelId;
        embed.addFields({
            name: 'Réglages des quêtes',
            value: `Salon des quêtes normales : ${questChannelId ? `<#${questChannelId}>` : 'non configuré'}\nQuêtes normales : **${areNormalQuestsEnabled(guildId) ? 'activées' : 'désactivées'}**\nApparitions spéciales : **${specialEnabled ? 'activées' : 'désactivées'}**\n\nClassement : fond **${settings.backgroundImage ? 'image configurée' : `#${settings.backgroundColor}`}**, cartes **#${settings.rowColor}**, contours **#${settings.borderColor}**, texte **#${settings.textColor}**`,
            inline: false
        });
        embed.addFields({
            name: 'Parcours normal',
            value: `**${Object.keys(getNormalQuestsConfig(guildId)).length} quêtes** configurées.`,
            inline: false
        });
    }
    if (category === 'roulette') {
        const enabled = (savedConfigs[guildId] || {}).rouletteEnabled !== false;
        const settings = getRouletteSettings(guildId);
        embed.addFields({
            name: 'Réglages',
            value: `Statut : **${enabled ? 'activée' : 'désactivée'}**\nTours par période : **${settings.maxSpins}**\nAttente avant réinitialisation : **${settings.cooldownHours} h**`,
            inline: false
        });
    }
    return embed;
}

function buildConfigPanelComponents(category, guildId) {
    if (category.startsWith('questManager_')) {
        const pageNumber = Math.max(0, Number(category.slice('questManager_'.length)) || 0);
        const quests = getNormalQuestsConfig(guildId);
        const entries = Object.entries(quests).slice(
            pageNumber * QUEST_MANAGER_PAGE_SIZE,
            (pageNumber + 1) * QUEST_MANAGER_PAGE_SIZE
        );
        const rows = [buildConfigCategoryRow('quests')];
        if (entries.length) {
            rows.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`config_quest_manager_select_${pageNumber}`)
                    .setPlaceholder('Choisir une quête à modifier')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(entries.map(([number, quest]) => ({
                        label: `${number}. ${quest.title}`.slice(0, 100),
                        value: number,
                        description: `${quest.type} · objectif ${quest.goal}`.slice(0, 100)
                    })))
            ));
        }
        rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_quest_add')
                    .setLabel('Ajouter une quête')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('config_quest_manager_prev')
                    .setLabel('Page précédente')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(pageNumber <= 0),
                new ButtonBuilder()
                    .setCustomId('config_quest_manager_next')
                    .setLabel('Page suivante')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled((pageNumber + 1) * QUEST_MANAGER_PAGE_SIZE >= Object.keys(quests).length),
                new ButtonBuilder()
                    .setCustomId('config_quest_manager_to_quests')
                    .setLabel('Retour aux quêtes')
                    .setStyle(ButtonStyle.Secondary)
            ));
        return rows;
    }

    if (category.startsWith('questEditor_')) {
        const questNumber = Number(category.slice('questEditor_'.length));
        const quest = getNormalQuestsConfig(guildId)[questNumber];
        if (!quest) return [buildConfigCategoryRow('quests')];
        return [
            buildConfigCategoryRow('quests'),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`config_quest_edit_${questNumber}`)
                    .setLabel('Modifier les informations')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`config_quest_delete_${questNumber}`)
                    .setLabel('Supprimer cette quête')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`config_quest_role_clear_${questNumber}`)
                    .setLabel('Retirer le rôle')
                    .setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId(`config_quest_role_${questNumber}`)
                    .setPlaceholder('Choisir le rôle à attribuer à la validation')
                    .setMinValues(1)
                    .setMaxValues(1)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_quest_manager_back')
                    .setLabel('Retour à la liste des quêtes')
                    .setStyle(ButtonStyle.Secondary)
            )
        ];
    }

    if (category === 'levelRewards') {
        return [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_category_levels')
                    .setLabel('Retour aux Levels')
                    .setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId('config_level_reward_role')
                    .setPlaceholder('Choisir un rôle à associer à un niveau')
                    .setMinValues(1)
                    .setMaxValues(1)
            )
        ];
    }

    if (category === 'logs') {
        const settings = getBotLogSettings(guildId);
        return [
            buildConfigCategoryRow(category),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_logs_toggle')
                    .setLabel(settings.enabled ? 'Désactiver tous les logs' : 'Activer tous les logs')
                    .setStyle(settings.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('config_logs_modules')
                    .setLabel('Modules')
                    .setStyle(ButtonStyle.Primary)
            ),
            new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('config_logs_default_channel')
                    .setPlaceholder('Choisir le salon par défaut des logs')
                    .setChannelTypes(ChannelType.GuildText)
                    .setMinValues(1)
                    .setMaxValues(1)
            )
        ];
    }

    if (category === 'logModules') {
        return [
            buildConfigCategoryRow(category),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('config_logs_back').setLabel('Retour aux Logs').setStyle(ButtonStyle.Secondary)
            ),
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('config_log_module_select')
                    .setPlaceholder('Choisir un module à configurer')
                    .addOptions(Object.entries(BOT_LOG_MODULES).map(([value, module]) => ({ label: module.label, value })))
            )
        ];
    }

    if (category.startsWith('logModule_')) {
        const key = category.slice('logModule_'.length);
        const module = BOT_LOG_MODULES[key];
        if (module) {
            const enabled = getBotLogSettings(guildId).modules[key].enabled;
            return [
                buildConfigCategoryRow(category),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('config_logs_modules_back').setLabel('Retour aux Modules').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`config_log_module_toggle_${key}`)
                        .setLabel(enabled ? 'Désactiver ce module' : 'Activer ce module')
                        .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success)
                ),
                new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId(`config_log_module_channel_${key}`)
                        .setPlaceholder('Choisir un salon spécifique (facultatif)')
                        .setChannelTypes(ChannelType.GuildText)
                        .setMinValues(1)
                        .setMaxValues(1)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`config_log_module_default_${key}`)
                        .setLabel('Utiliser le salon par défaut')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`config_log_module_color_${key}`)
                        .setLabel('Couleur')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`config_log_module_avatar_${key}`)
                        .setLabel('Avatar')
                        .setStyle(ButtonStyle.Secondary)
                )
            ];
        }
    }

    if (category === 'admin') {
        const rows = [buildConfigCategoryRow(category)];
        const adminButtons = [
            ['logs', 'Logs généraux'],
            ['commandlogs', 'Logs commandes'],
            ['invites', 'Invitations'],
            ['questlogs', 'Logs quêtes'],
            ['proof', 'Salon preuves'],
            ['specialquest', 'Quêtes spéciales'],
            ['normalquests', 'Quêtes normales'],
            ['specialquests', 'Apparitions spéciales'],
            ['validatorrole', 'Rôles validateurs'],
            ['rankup', 'Annonces Rankup'],
            ['deletedmessages', 'Messages supprimés'],
            ['tokens', 'Jetons et boutique']
        ].map(([key, label]) => new ButtonBuilder()
            .setCustomId(key === 'deletedmessages' ? 'config_admin_deleted_messages' : `config_admin_open_${key}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Secondary));
        rows.push(new ActionRowBuilder().addComponents(...adminButtons.slice(0, 5)));
        rows.push(new ActionRowBuilder().addComponents(...adminButtons.slice(5, 10)));
        if (adminButtons.length > 10) rows.push(new ActionRowBuilder().addComponents(...adminButtons.slice(10)));
        return rows;
    }

    if (category.startsWith('admin_')) {
        const key = category.slice('admin_'.length);
        const page = ADMIN_CONFIG_PAGES[key];
        if (page) {
            const rows = [
                buildConfigCategoryRow(category),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_admin_back')
                        .setLabel('Retour Administration')
                        .setStyle(ButtonStyle.Secondary)
                )
            ];
            if (page.channelId) {
                rows.push(new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId(`config_admin_channel_${key}`)
                        .setPlaceholder('Choisir le salon')
                        .setChannelTypes(ChannelType.GuildText)
                        .setMinValues(1)
                        .setMaxValues(1)
                ));
            }
            if (key === 'tokens') {
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_token_economy_edit')
                        .setLabel('Modifier les tarifs et récompenses')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('config_token_drop_disable')
                        .setLabel('Désactiver les cadeaux automatiques')
                        .setStyle(ButtonStyle.Danger)
                ));
            }
            if (key === 'questlogs' || key === 'specialquest' || key === 'validatorrole') {
                rows.push(new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId(`config_admin_role_${key}`)
                        .setPlaceholder(key === 'validatorrole' ? 'Choisir un rôle validateur' : 'Choisir le rôle à mentionner')
                        .setMinValues(1)
                        .setMaxValues(1)
                ));
            }
            if (key === 'rankup') {
                rows.push(new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('config_rankup_role_type')
                        .setPlaceholder('Choisir le rôle à configurer')
                        .addOptions(
                            { label: 'Rôle Test BMF', value: 'test' },
                            { label: 'Rôle Membre BMF (test réussi)', value: 'member' },
                            { label: 'Rôle à mentionner', value: 'ping' }
                        )
                ));
                rows.push(new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('config_rankup_role')
                        .setPlaceholder('Choisir le rôle sélectionné ci-dessus')
                        .setMinValues(1)
                        .setMaxValues(1)
                ));
                rows[1].addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_rankup_edit')
                        .setLabel('Modifier les messages')
                        .setStyle(ButtonStyle.Primary)
                );
            }
            if (key === 'invites') {
                const enabled = (savedConfigs[guildId] || {}).inviteLogsEnabled !== false;
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_admin_toggle_invites')
                        .setLabel(enabled ? 'Désactiver les logs d’invitations' : 'Activer les logs d’invitations')
                        .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success)
                ));
            }
            if (key === 'normalquests') {
                const enabled = areNormalQuestsEnabled(guildId);
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_admin_toggle_normalquests')
                        .setLabel(enabled ? 'Désactiver les quêtes' : 'Activer les quêtes')
                        .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success)
                ));
            }
            if (key === 'specialquests') {
                const data = loadSpecialQuestsData();
                const enabled = getSpecialGuildState(data, guildId).enabled !== false;
                rows.push(new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('config_admin_toggle_specialquests')
                        .setLabel(enabled ? 'Désactiver les apparitions' : 'Activer les apparitions')
                        .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('config_admin_spawn_specialquest')
                        .setLabel('Lancer une quête maintenant')
                        .setStyle(ButtonStyle.Primary)
                ));
            }
            return rows;
        }
    }

    const categoryOptions = [
        { label: 'Accueil', value: 'home', description: 'Présentation du panneau de configuration' },
        { label: 'Administration', value: 'admin', description: 'Logs, rôles et réglages du serveur' },
        { label: 'Fun', value: 'fun', description: 'Commandes de divertissement' },
        { label: 'Quêtes', value: 'quests', description: 'Parcours, validations et classements' },
        { label: 'Roulette', value: 'roulette', description: 'Tours et récompenses' },
        { label: 'Levels', value: 'levels', description: 'XP, niveaux et récompenses de rôles' },
        { label: 'Tickets', value: 'tickets', description: 'Panneaux de tickets et support' }
    ];
    const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId('config_category_select')
        .setPlaceholder(category === 'home' ? 'Accueil' : `Rubrique : ${CONFIG_CATEGORIES[category]?.title || 'Accueil'}`)
        .addOptions(categoryOptions);
    const rows = [new ActionRowBuilder().addComponents(categoryMenu)];

    if (category === 'levels') {
        const enabled = getLevelSettings(guildId).enabled;
        rows.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('config_levels_toggle')
                .setLabel(enabled ? 'Désactiver les levels' : 'Activer les levels')
                .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('config_levels_edit')
                .setLabel('Annonce & image')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('config_level_xp')
                .setLabel('Gains XP')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('config_toplevel_edit')
                .setLabel('Personnaliser Top Levels')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('config_level_rewards')
                .setLabel('Récompenses')
                .setStyle(ButtonStyle.Primary)
        ));
            rows.push(new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                .setCustomId('config_level_channel')
                .setPlaceholder('Choisir le salon des annonces de niveau')
                .setChannelTypes(ChannelType.GuildText)
                .setMinValues(1)
                .setMaxValues(1)
            ));
    }
        if (category === 'quests') {
            rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_admin_toggle_normalquests')
                    .setLabel(areNormalQuestsEnabled(guildId) ? 'Désactiver les quêtes' : 'Activer les quêtes')
                    .setStyle(areNormalQuestsEnabled(guildId) ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('config_admin_open_specialquest')
                    .setLabel('Configurer les quêtes spéciales')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('config_admin_toggle_specialquests')
                    .setLabel('Activer / désactiver les spawns')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('config_admin_spawn_specialquest')
                    .setLabel('Lancer une quête spéciale')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('config_questboard_edit')
                    .setLabel('Apparence du classement')
                    .setStyle(ButtonStyle.Primary)
            ));
            rows.push(new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('config_quest_channel')
                    .setPlaceholder('Choisir le salon des quêtes normales')
                    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                    .setMinValues(1)
                    .setMaxValues(1)
            ));
            rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_quest_channel_clear')
                    .setLabel('Retirer le salon')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!savedConfigs[guildId]?.questChannelId)
            ));
            rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_quest_manager_open')
                    .setLabel('Gérer les quêtes normales')
                    .setStyle(ButtonStyle.Primary)
            ));
        }
        if (category === 'tickets') {
            rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_ticket_create')
                    .setLabel('Créer un panneau de tickets')
                    .setStyle(ButtonStyle.Primary)
            ));
        }
        if (category === 'roulette') {
            const enabled = (savedConfigs[guildId] || {}).rouletteEnabled !== false;
            rows.push(new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_roulette_toggle')
                    .setLabel(enabled ? 'Désactiver la roulette' : 'Activer la roulette')
                    .setStyle(enabled ? ButtonStyle.Danger : ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('config_roulette_edit')
                    .setLabel('Modifier tours et attente')
                    .setStyle(ButtonStyle.Primary)
            ));
        }
    return rows;
}

// Au démarrage du bot
client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Mettre en cache les invitations de tous les serveurs
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            const guildInvites = await guild.invites.fetch();
            const codeUses = new Map();
            guildInvites.forEach(inv => codeUses.set(inv.code, inv.uses));
            invitesCache.set(guild.id, codeUses);
        } catch (err) {
            console.error(`⚠️ Impossible d'obtenir les invitations pour le serveur ${guild.name}`);
        }
    }
    for (const guild of client.guilds.cache.values()) {
        refreshLevelVoiceSessions(guild);
    }
    await Promise.all(client.guilds.cache.map(guild =>
        processSpecialQuestsForGuild(guild).catch(err => console.error(`Erreur quêtes spéciales ${guild.name} :`, err))
    ));
    console.log(`🔗 Invitations mises en cache avec succès.`);
});

// Maintenir le cache à jour lors de la création d'une invitation
client.on('inviteCreate', invite => {
    const guildInvites = invitesCache.get(invite.guild.id) || new Map();
    guildInvites.set(invite.code, invite.uses);
    invitesCache.set(invite.guild.id, guildInvites);
});

// Maintenir le cache à jour lors de la suppression d'une invitation
client.on('inviteDelete', invite => {
    const guildInvites = invitesCache.get(invite.guild.id);
    if (guildInvites) guildInvites.delete(invite.code);
});

// --- ÉVÉNEMENT : Un membre rejoint ---
client.on('guildMemberAdd', async (member) => {
    const guildConfig = savedConfigs[member.guild.id] || {};
    const inviteLogChannelId = guildConfig.inviteLogsEnabled === false
        ? null
        : guildConfig.inviteLogChannelId || guildConfig.logChannelId;
    const channel = inviteLogChannelId
        ? await member.guild.channels.fetch(inviteLogChannelId).catch(() => null)
        : null;

    let usedInvite = null;
    let totalInvites = 0;
    const previousFetch = inviteFetchQueues.get(member.guild.id) || Promise.resolve();
    let releaseFetch;
    const currentFetch = new Promise(resolve => {
        releaseFetch = resolve;
    });
    inviteFetchQueues.set(member.guild.id, currentFetch);

    await previousFetch;
    try {
        const cachedInvites = invitesCache.get(member.guild.id) || new Map();
        const newInvites = await member.guild.invites.fetch();
        const pendingUses = pendingInviteUses.get(member.guild.id) || [];

        const codeUses = new Map();
        newInvites.forEach(inv => {
            const currentUses = Number(inv.uses) || 0;
            const previousUses = Number(cachedInvites.get(inv.code)) || 0;
            for (let use = previousUses; use < currentUses; use += 1) {
                if (inv.inviter) pendingUses.push(inv);
            }
            codeUses.set(inv.code, currentUses);
        });
        invitesCache.set(member.guild.id, codeUses);
        pendingInviteUses.set(member.guild.id, pendingUses);
        usedInvite = pendingUses.shift() || null;
        if (pendingUses.length) {
            pendingInviteUses.set(member.guild.id, pendingUses);
        } else {
            pendingInviteUses.delete(member.guild.id);
        }

        if (usedInvite && usedInvite.inviter) {
            totalInvites = newInvites
                .filter(inv => inv.inviter && inv.inviter.id === usedInvite.inviter.id)
                .reduce((acc, inv) => acc + inv.uses, 0);
        }
    } catch (err) {
        console.error(`Erreur récupération des invitations après l’arrivée de ${member.id} sur ${member.guild.id} :`, err);
    } finally {
        releaseFetch();
        if (inviteFetchQueues.get(member.guild.id) === currentFetch) {
            inviteFetchQueues.delete(member.guild.id);
        }
    }

    if (usedInvite && usedInvite.inviter) {
        invitedByCache.set(member.id, usedInvite.inviter.username);
        if (channel) {
            await sendInviteLog(
                member.guild,
                `${member} vient de rejoindre. Il a été invité par **${usedInvite.inviter.username}** qui a désormais **${totalInvites}** invitations !`
            );
        }
        await addSpecialQuestProgress(member.guild, usedInvite.inviter.id, 'invite', 1);

        if (!areNormalQuestsEnabled(member.guild.id)) {
            return;
        }

        const { data: inviterData, state: inviterState, storageKey: inviterStorageKey } =
            getQuestState(usedInvite.inviter.id, member.guild.id);

        if (!inviterState.started) {
            inviterData[inviterStorageKey] = inviterState;
            saveQuestsData(inviterData);
            return;
        }

        const guildQuests = getNormalQuestsConfig(member.guild.id);
        const inviterQuest = guildQuests[inviterState.currentQuest];

        if (inviterQuest && inviterQuest.type === 'invite') {
            inviterState.progress = (Number(inviterState.progress) || 0) + 1;

            if (inviterState.progress >= inviterQuest.goal) {
                const nextQuestNumber = inviterState.currentQuest + 1;
                const nextQuest = guildQuests[nextQuestNumber];

                inviterState.currentQuest = nextQuestNumber;
                inviterState.progress = 0;
                inviterState.inviteCount = 0;
                inviterState.completed = !nextQuest;
                inviterState.started = true;
                inviterData[inviterStorageKey] = inviterState;
                saveQuestsData(inviterData);

                const inviterMember = await member.guild.members.fetch(usedInvite.inviter.id).catch(() => null);
                if (inviterMember) {
                    await grantQuestRoleReward(member.guild, inviterMember, inviterQuest.reward, inviterQuest.roleId);

                    const congratEmbed = new EmbedBuilder()
                        .setTitle('🎉 Quête validée !')
                        .setDescription(`${inviterMember} a terminé la quête **${inviterQuest.title}**.`)
                        .addFields(
                            { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(inviterQuest), inline: false },
                            { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest ? nextQuest.title : 'Fin'}**`, inline: false },
                            { name: '🎯 Objectif', value: nextQuest ? `Inviter ${nextQuest.goal} personnes pour la valider.` : 'Toutes les quêtes sont terminées.', inline: false }
                        )
                        .setColor(0x00FF7F)
                        .setTimestamp();

                    await sendNormalQuestMessage(member.guild, {
                        content: `${inviterMember}`,
                        embeds: [congratEmbed],
                        components: [buildQuestOwnerButtons(inviterMember.id, {
                            proof: nextQuest ? isProofQuest(nextQuest) : false,
                            validateQuestNumber: nextQuestNumber
                        })],
                        allowedMentions: { users: [inviterMember.id] }
                    });
                }
            } else {
                inviterData[inviterStorageKey] = inviterState;
                saveQuestsData(inviterData);
            }
        }

    } else if (channel) {
        await sendInviteLog(member.guild, `${member} vient de rejoindre, mais je n'ai pas enregistré qui l'a invité.`);
    }
});

// --- ÉVÉNEMENT : Un membre quitte ---
client.on('guildMemberRemove', async (member) => {
    const guildConfig = savedConfigs[member.guild.id];
    if (!guildConfig || !guildConfig.logChannelId) return;

    const channel = await member.guild.channels.fetch(guildConfig.logChannelId).catch(() => null);
    if (!channel) return;

    const inviterUsername = invitedByCache.get(member.id);

    if (inviterUsername) {
        await channel.send(`**${member.user.username}** est parti. Il a été invité par **${inviterUsername}**.`);
        invitedByCache.delete(member.id);
    } else {
        await channel.send(`**${member.user.username}** est parti, mais je n'ai pas enregistré qui l'a invité.`);
    }
});

// Fonction utilitaire pour envoyer un message dans le salon de logs général du serveur
async function sendLog(guild, embed) {
    try {
        const guildConfig = savedConfigs[guild.id] || {};
        const targetChannelId = guildConfig.questLogChannelId || guildConfig.logChannelId;
        if (!targetChannelId) return;

        const logChannel = await guild.channels.fetch(targetChannelId).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (err) {
        console.error("Erreur lors de l'envoi du log :", err);
    }
}

async function sendInviteLog(guild, content) {
    try {
        const guildConfig = savedConfigs[guild.id] || {};
        if (guildConfig.inviteLogsEnabled === false) return;
        const targetChannelId = guildConfig.inviteLogChannelId || guildConfig.logChannelId;
        if (!targetChannelId) return;

        const inviteChannel = await guild.channels.fetch(targetChannelId).catch(() => null);
        if (inviteChannel) {
            await inviteChannel.send(content);
        }
    } catch (err) {
        console.error("Erreur lors de l'envoi du log d'invites :", err);
    }
}

async function sendCommandLog(interaction) {
    if (!interaction.guild) return;
    const settings = getBotLogSettings(interaction.guild.id);
    const moduleKey = getCommandLogModule(interaction.commandName);
    const moduleSettings = settings.modules[moduleKey];
    if (!settings.enabled || !moduleSettings?.enabled) return;
    const channelId = moduleSettings.channelId || settings.defaultChannelId;
    if (!channelId) return;

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle(`Commande • ${BOT_LOG_MODULES[moduleKey].label}`)
        .setDescription(`${interaction.user} a utilisé **/${interaction.commandName}**.`)
        .addFields(
            { name: 'Salon', value: interaction.channel ? `${interaction.channel}` : 'Inconnu', inline: true },
            { name: 'Heure', value: `<t:${Math.floor(interaction.createdTimestamp / 1000)}:F>`, inline: true }
        )
        .setColor(parseInt(moduleSettings.color, 16));
    if (moduleSettings.avatarUrl) embed.setThumbnail(moduleSettings.avatarUrl);

    await channel.send({ embeds: [embed] }).catch(err => console.error('Erreur log commande :', err));
}

async function sendDeletedMessageLog(message) {
    if (!message.guild || !message.author || message.author.bot) return;
    const settings = getBotLogSettings(message.guild.id);
    const moduleSettings = settings.modules.deletedMessages;
    if (!settings.enabled || !moduleSettings.enabled) return;

    const channelId = moduleSettings.channelId || settings.defaultChannelId;
    const channel = channelId ? await message.guild.channels.fetch(channelId).catch(() => null) : null;
    if (!channel || !channel.isTextBased()) return;

    const content = typeof message.content === 'string' && message.content.trim()
        ? message.content.slice(0, 3500)
        : message.partial
            ? 'Contenu indisponible : le message n’était pas en cache.'
            : 'Aucun texte.';
    const attachments = [...(message.attachments?.values() || [])];
    const imageAttachment = attachments.find(attachment =>
        attachment.contentType?.startsWith('image/') || /\.(?:png|jpe?g|gif|webp|avif)(?:\?|$)/i.test(attachment.url)
    );
    const imageEmbed = [...(message.embeds || [])].find(embed => embed.image?.url || embed.thumbnail?.url);
    const attachmentLines = attachments.slice(0, 8).map(attachment =>
        `• [${String(attachment.name || 'Fichier').slice(0, 80)}](${attachment.url})`
    );
    const linkLines = [...(message.embeds || [])]
        .filter(embed => embed.url)
        .slice(0, 5)
        .map(embed => `• [${String(embed.title || 'Aperçu de lien').slice(0, 80)}](${embed.url})`);

    const embed = new EmbedBuilder()
        .setTitle('Message supprimé')
        .setDescription(`**Auteur du message :** ${message.author.tag}\n**Salon :** ${message.channel}\n\n**Contenu :**\n${content}`)
        .setColor(parseInt(moduleSettings.color, 16))
        .setTimestamp(message.createdAt || new Date());
    if (moduleSettings.avatarUrl) embed.setThumbnail(moduleSettings.avatarUrl);
    if (attachmentLines.length) {
        embed.addFields({ name: 'Pièces jointes', value: attachmentLines.join('\n'), inline: false });
    }
    if (linkLines.length) {
        embed.addFields({ name: 'Liens / aperçus', value: linkLines.join('\n'), inline: false });
    }
    const previewImageUrl = imageAttachment?.url || imageEmbed?.image?.url || imageEmbed?.thumbnail?.url;
    if (previewImageUrl) embed.setImage(previewImageUrl);
    embed.setFooter({ text: `ID du message : ${message.id}` });

    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } })
        .catch(err => console.error('Erreur log message supprimé :', err));
}

// Enregistrement global de toutes les commandes
const commands = [
    new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Définit le salon où seront envoyés les logs du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt => 
            opt.setName('salon')
               .setDescription('Le salon textuel pour les logs')
               .addChannelTypes(ChannelType.GuildText)
               .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('setcommandlogs')
        .setDescription('Choisit le salon dédié aux commandes utilisées sur ce serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon textuel qui recevra les commandes exécutées')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('rankup')
        .setDescription('Permet de promouvoir un membre et de lui attribuer un rôle')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à promouvoir').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Le rôle à attribuer').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison de la promotion').setRequired(true)),

    new SlashCommandBuilder()
        .setName('derank')
        .setDescription('Permet de rétrograder un membre et de lui changer ses rôles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à rétrograder').setRequired(true))
        .addRoleOption(opt => opt.setName('role_a_retirer').setDescription('Le rôle à retirer').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison du derank').setRequired(true))
        .addRoleOption(opt => opt.setName('role_a_ajouter').setDescription('Le nouveau rôle à ajouter (facultatif)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit définitivement un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à bannir').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison du ban').setRequired(true)),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannit un membre via son ID Discord')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(opt => opt.setName('id').setDescription("L'ID Discord de l'utilisateur à débannir").setRequired(true)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à expulser').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison du kick').setRequired(true)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertit un membre et lui donne le rôle correspondant')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à avertir').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison').setRequired(true)),

    new SlashCommandBuilder()
        .setName('tempmute')
        .setDescription('Mute temporairement un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à mute').setRequired(true))
        .addIntegerOption(opt => opt.setName('duree').setDescription('Durée en minutes').setRequired(true))
        .addStringOption(opt => opt.setName('raison').setDescription('La raison').setRequired(true)),

    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Retire le mute d\'un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à unmute').setRequired(true)),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche les informations d\'un membre')
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre ciblé').setRequired(false)),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre de messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt => opt.setName('nombre').setDescription('Nombre de messages à supprimer (1 à 100)').setRequired(true)),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Ouvre le panneau interactif pour créer un embed et configurer un système de ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => 
            opt.setName('nom')
               .setDescription('Le nom de sauvegarde de ton embed (ex: ticket)')
               .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('invitelogs')
        .setDescription('Configure le système de suivi des invitations')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver les logs')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'enable' },
                    { name: 'Désactiver', value: 'disable' }
                )
        )
        .addChannelOption(option => 
            option.setName('salon')
                .setDescription('Le salon où envoyer les logs (obligatoire si activé)')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('logquest')
        .setDescription('Configure le salon de logs et le rôle à ping pour les validations de quêtes.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où les validations de quêtes seront envoyées')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à ping quand une quête est validée')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('setproof')
        .setDescription('Configure le salon où les joueurs envoient les preuves de leurs quêtes SchoolRP.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où les preuves seront envoyées')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('setspecialquest')
        .setDescription('Configure le salon et le rôle mentionné pour les quêtes spéciales.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où apparaîtront les quêtes spéciales')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à mentionner lors du spawn')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('quetespeciales')
        .setDescription('Active, désactive ou lance les apparitions de quêtes spéciales.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer les apparitions automatiques', value: 'activer' },
                    { name: 'Désactiver les apparitions automatiques', value: 'desactiver' },
                    { name: 'Lancer une quête maintenant', value: 'lancer' },
                    { name: 'Lancer la quête légendaire de test (#51)', value: 'lancer_test' }
                )
        ),

    new SlashCommandBuilder()
        .setName('linkroblox')
        .setDescription('Lie ton pseudo Roblox à ton compte Discord.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addStringOption(option =>
            option.setName('pseudo')
                .setDescription('Ton pseudo Roblox exact')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('roblox')
        .setDescription('Affiche le compte Roblox lié d’un membre ou de toi-même.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à vérifier (optionnel)')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('robloxliens')
        .setDescription('Liste les membres du serveur ayant lié leur compte Roblox.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page à afficher (10 comptes par page)')
                .setMinValue(1)
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('unlinkroblox')
        .setDescription('Supprime le lien Roblox associé à ton compte Discord.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Affiche ton avancement des quêtes et peut démarrer le parcours.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('config')
        .setDescription('Ouvre le panneau de configuration du bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Ouvre directement les réglages d’administration du bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('level')
        .setDescription('Affiche ton niveau ou celui d’un membre.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à consulter')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('toplevel')
        .setDescription('Affiche le classement des niveaux du serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('dropadmin')
        .setDescription('Ajoute de l’XP ou des niveaux à un membre.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre qui reçoit la récompense')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisir entre XP et niveaux')
                .setRequired(true)
                .addChoices(
                    { name: 'XP', value: 'xp' },
                    { name: 'Niveaux', value: 'niveaux' }
                )
        )
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Quantité à ajouter (sans plafond configuré)')
                .setMinValue(1)
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('quetes')
        .setDescription('Active ou désactive les quêtes normales sur ce serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Activer ou désactiver la progression des quêtes normales')
                .setRequired(true)
                .addChoices(
                    { name: 'Activer', value: 'activer' },
                    { name: 'Désactiver', value: 'desactiver' }
                )
        ),

    new SlashCommandBuilder()
        .setName('resetquest')
        .setDescription('Remet à zéro la progression des quêtes de ce serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('topquetes')
        .setDescription('Affiche le classement des meilleurs membres sur les quêtes.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('questlist')
        .setDescription('Affiche la liste complète des quêtes, leurs objectifs et leurs récompenses.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Joue à la roulette ; gagne des jetons avec /quotidien et achète des tours via /boutique.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('soldejetons')
        .setDescription('Affiche ton solde de jetons virtuels.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('quotidien')
        .setDescription('Récupère tes jetons quotidiens et fais progresser ta série.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('boutique')
        .setDescription('Achète des tours de roulette avec tes jetons virtuels.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    new SlashCommandBuilder()
        .setName('dropjetons')
        .setDescription('Lance un cadeau de jetons que le premier membre à réagir remportera.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addIntegerOption(option =>
            option.setName('montant')
                .setDescription('Nombre de jetons à offrir (50 à 1000, 100 par défaut)')
                .setMinValue(50)
                .setMaxValue(1000)
                .setRequired(false)
        )
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon du cadeau (salon actuel par défaut)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('setdropjetons')
        .setDescription('Configure ou désactive les cadeaux automatiques de jetons.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon textuel, ou vide pour désactiver les cadeaux automatiques')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('resetroulette')
        .setDescription('Réinitialise les tours de roulette d’un membre (administrateurs uniquement).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Membre concerné (toi par défaut)')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('validermanuel')
        .setDescription('Valide une quête manuelle pour un membre après preuve ou vérification.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre à valider').setRequired(true)),

    new SlashCommandBuilder()
        .setName('passerquete')
        .setDescription('Fait passer un membre à la quête suivante.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('membre').setDescription('Le membre concerné').setRequired(true)),

    new SlashCommandBuilder()
        .setName('setquestvalidatorrole')
        .setDescription('Ajoute un rôle autorisé à valider les quêtes.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Rôle autorisé à valider les quêtes')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('send')
        .setDescription('Envoie un message ou un embed dans un salon choisi.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Le salon où envoyer le message')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Texte principal à envoyer')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Titre de l’embed (optionnel)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('URL de l’image à afficher (optionnel)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur au format hex, ex: #FF99CC')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('footer')
                .setDescription('Texte du footer (optionnel)')
                .setRequired(false)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Toutes les commandes ont été enregistrées avec succès !');
    } catch (error) { console.error(error); }
})();

async function sendMP(user, messageContent) {
    try {
        await user.send(messageContent);
        return true;
    } catch (error) {
        return false;
    }
}

async function sendQuestLog(guild, embed) {
    try {
        const guildConfig = savedConfigs[guild.id] || {};
        const questLogChannelId = guildConfig.questLogChannelId || guildConfig.logChannelId;
        if (!questLogChannelId) return false;

        const questLogChannel = await guild.channels.fetch(questLogChannelId).catch(() => null);
        if (!questLogChannel) return false;

        const pingRoleId = guildConfig.questPingRoleId;
        const pingText = pingRoleId ? `<@&${pingRoleId}>` : '';
        await questLogChannel.send({ content: pingText || undefined, embeds: [embed] });
        return true;
    } catch (err) {
        console.error('Erreur lors de l\'envoi du log de quête :', err);
        return false;
    }
}

function hasQuestValidationPermission(member) {
    if (!member) return false;

    if (member.permissions.has(PermissionFlagsBits.Administrator) ||
        member.permissions.has(PermissionFlagsBits.ManageMessages) ||
        member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return true;
    }

    const guildConfig = savedConfigs[member.guild.id] || {};
    const allowedRoleIds = Array.isArray(guildConfig.questValidatorRoleIds)
        ? guildConfig.questValidatorRoleIds
        : guildConfig.questPingRoleId
            ? [guildConfig.questPingRoleId]
            : [];

    return member.roles.cache.some(role => allowedRoleIds.includes(role.id));
}

// --- ÉCOUTEUR DES SLASH COMMANDS ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;
    if (commandName === 'roulette' || commandName === 'spin') {
        if ((savedConfigs[interaction.guild.id] || {}).rouletteEnabled === false) {
            return await interaction.reply({ content: '⏸️ La roulette est désactivée sur ce serveur.' });
        }

        const rouletteKey = getQuestStorageKey(interaction.user.id, interaction.guild.id);
        if (rouletteSpinsInProgress.has(rouletteKey)) {
            return await interaction.reply({
                content: '⏳ Ta roulette est déjà en cours. Attends le résultat avant de relancer.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const { data: rouletteData, state } = getRouletteState(interaction.user.id, interaction.guild.id);
        const rouletteSettings = getRouletteSettings(interaction.guild.id);
        const spinsLeft = Math.max(0, rouletteSettings.maxSpins - state.spinsUsed) + state.bonusSpins;

        if (spinsLeft <= 0) {
            const resetMs = rouletteSettings.cooldownHours * 60 * 60 * 1000 - (Date.now() - state.lastResetAt);
            const days = Math.floor(resetMs / (24 * 60 * 60 * 1000));
            const hours = Math.floor((resetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((resetMs % (60 * 60 * 1000)) / 60000);
            return await interaction.reply({
                content: `⏳ Tu as utilisé tes **${rouletteSettings.maxSpins} tours**. Reviens dans ${days}j ${hours}h ${minutes}min pour rejouer.`,
            });
        }

        rouletteSpinsInProgress.add(rouletteKey);
        const usedBonusSpin = state.bonusSpins > 0;
        if (usedBonusSpin) {
            state.bonusSpins -= 1;
        } else {
            state.spinsUsed += 1;
        }
        rouletteData[rouletteKey] = state;

        try {
            saveRouletteData(rouletteData);
            await interaction.deferReply();
        } catch (err) {
            if (usedBonusSpin) {
                state.bonusSpins += 1;
            } else {
                state.spinsUsed = Math.max(0, state.spinsUsed - 1);
            }
            rouletteData[rouletteKey] = state;
            try {
                saveRouletteData(rouletteData);
            } catch (saveError) {
                console.error(`Impossible de restaurer le tour de roulette après un échec de réservation (${interaction.user.id}) :`, saveError);
            }
            rouletteSpinsInProgress.delete(rouletteKey);
            throw err;
        }
    }

    if (commandName !== 'setcommandlogs') {
        sendCommandLog(interaction).catch(err => console.error('Erreur log commande :', err));
    }

    if (commandName === 'setcommandlogs') {
        const channel = options.getChannel('salon');
        if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
        savedConfigs[interaction.guild.id].commandLogChannelId = channel.id;
        saveConfigsToFile();
        await sendCommandLog(interaction);
        return await interaction.reply({
            content: `✅ Les commandes exécutées seront désormais journalisées dans ${channel}. Les logs d’invitations restent séparés.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'send') {
        const salon = options.getChannel('salon');
        const titre = options.getString('titre');
        const description = options.getString('description');
        const imageUrl = options.getString('image');
        const couleur = options.getString('couleur') || '#5865F2';
        const footer = options.getString('footer');

        const targetChannel = await interaction.guild.channels.fetch(salon.id).catch(() => null);
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            return await interaction.reply({ content: '⚠️ Le salon sélectionné est invalide ou introuvable.', flags: [MessageFlags.Ephemeral] });
        }

        const normalizedColor = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(couleur)
            ? (couleur.startsWith('#') ? couleur : `#${couleur}`)
            : '#e9a5b9';

        const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(parseInt(normalizedColor.slice(1), 16));

        if (titre) embed.setTitle(titre);
        if (imageUrl) embed.setImage(imageUrl);
        if (footer) embed.setFooter({ text: footer });

        await targetChannel.send({ embeds: [embed] });

        return await interaction.reply({
            content: `✅ Message envoyé dans ${salon}.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'linkroblox') {
        const robloxUsername = options.getString('pseudo')?.trim();

        if (!robloxUsername || robloxUsername.length < 3 || robloxUsername.length > 24) {
            return await interaction.reply({
                content: '⚠️ Le pseudo Roblox doit contenir entre 3 et 24 caractères.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const existingLink = getLinkedRobloxAccount(interaction.guild.id, interaction.user.id);
        if (existingLink) {
            return await interaction.reply({
                content: `✅ Ton compte Discord est déjà lié à Roblox : **${existingLink.robloxUsername}**\nRecherche Roblox : https://www.roblox.com/search/users?keyword=${encodeURIComponent(existingLink.robloxUsername)}`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const resolvedUser = await resolveRobloxUser(robloxUsername);
        if (!resolvedUser) {
            return await interaction.editReply({
                content: `⚠️ Le pseudo **${robloxUsername}** est introuvable sur Roblox. Vérifie l’orthographe et réessaie.`
            });
        }

        const linkPayload = {
            robloxId: resolvedUser.robloxId,
            robloxUsername: resolvedUser.robloxUsername,
            avatarUrl: resolvedUser.avatarUrl,
            profileUrl: resolvedUser.profileUrl,
            linkedAt: new Date().toISOString()
        };

        setLinkedRobloxAccount(interaction.guild.id, interaction.user.id, linkPayload);

        const linkedRole = findRobloxLinkedRole(interaction.guild);

        if (linkedRole) {
            try {
                await interaction.member.roles.add(linkedRole);
            } catch (err) {
                console.error('Impossible d’ajouter le rôle Roblox lié :', err);
            }
        }

        const profileEmbed = new EmbedBuilder()
            .setTitle('✅ Compte Roblox lié')
            .setColor(0x00A2FF)
            .setThumbnail(resolvedUser.avatarUrl)
            .addFields(
                { name: 'Pseudo Roblox', value: `**${resolvedUser.robloxUsername}**`, inline: true },
                { name: 'Compte Discord', value: `${interaction.user}`, inline: true },
                { name: 'Profil Roblox', value: `[Ouvrir le profil](${resolvedUser.profileUrl})`, inline: false },
                { name: 'Statut', value: '✅ Liaison confirmée', inline: false }
            )
            .setTimestamp();

        return await interaction.editReply({ embeds: [profileEmbed] });
    }

    if (commandName === 'roblox') {
        const targetMember = options.getUser('membre') || interaction.user;
        const linked = getLinkedRobloxAccount(interaction.guild.id, targetMember.id);

        if (!linked) {
            return await interaction.reply({
                content: targetMember.id === interaction.user.id
                    ? '⚠️ Tu n’as pas encore lié ton pseudo Roblox. Fais `/linkroblox pseudo:MonPseudo`.'
                    : '⚠️ Ce membre n’a pas encore lié son pseudo Roblox.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const profileUrl = linked.profileUrl || `https://www.roblox.com/search/users?keyword=${encodeURIComponent(linked.robloxUsername)}`;
        const linkedDate = linked.linkedAt ? new Date(linked.linkedAt).toLocaleString('fr-FR') : 'Inconnue';
        const avatarUrl = linked.avatarUrl || 'https://images.habbo.com/web_images/habbo-web-articles/roblox-logo.png';

        const profileEmbed = new EmbedBuilder()
            .setTitle('👤 Profil Roblox lié')
            .setColor(0x00D26A)
            .setThumbnail(avatarUrl)
            .addFields(
                { name: 'Pseudo Roblox', value: `**${linked.robloxUsername}**`, inline: true },
                { name: 'Compte Discord', value: `${targetMember}`, inline: true },
                { name: 'Lien Roblox', value: `[Ouvrir le profil](${profileUrl})`, inline: false },
                { name: 'Lié le', value: linkedDate, inline: false },
                { name: 'Statut', value: '✅ Compte vérifié', inline: false }
            )
            .setTimestamp();

        return await interaction.reply({ embeds: [profileEmbed], flags: [MessageFlags.Ephemeral] });
    }

    if (commandName === 'robloxliens') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Cette commande est réservée aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }

        const linkedAccounts = loadRobloxLinksData().linked || {};
        const guildPrefix = `${interaction.guild.id}:`;
        const entries = Object.entries(linkedAccounts)
            .filter(([key, account]) =>
                key.startsWith(guildPrefix) &&
                /^\d{17,20}$/.test(key.slice(guildPrefix.length)) &&
                account &&
                typeof account.robloxUsername === 'string' &&
                account.robloxUsername.trim()
            )
            .map(([key, account]) => ({
                discordId: key.slice(guildPrefix.length),
                robloxUsername: account.robloxUsername.trim(),
                profileUrl: /^https:\/\/www\.roblox\.com\/users\/\d+\/profile\/?$/.test(account.profileUrl || '')
                    ? account.profileUrl
                    : /^\d+$/.test(String(account.robloxId || ''))
                        ? `https://www.roblox.com/users/${encodeURIComponent(account.robloxId)}/profile`
                        : `https://www.roblox.com/search/users?keyword=${encodeURIComponent(account.robloxUsername.trim())}`,
                linkedAt: account.linkedAt
            }))
            .sort((a, b) => a.robloxUsername.localeCompare(b.robloxUsername, 'fr', { sensitivity: 'base' }));

        if (entries.length === 0) {
            return await interaction.reply({
                content: 'Aucun compte Roblox n’est lié pour ce serveur.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const pageSize = 10;
        const totalPages = Math.ceil(entries.length / pageSize);
        const requestedPage = options.getInteger('page') || 1;
        if (requestedPage > totalPages) {
            return await interaction.reply({
                content: `❌ Cette page n’existe pas. Il y a ${totalPages} page${totalPages > 1 ? 's' : ''} de comptes liés.`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const pageEntries = entries.slice((requestedPage - 1) * pageSize, requestedPage * pageSize);
        const description = pageEntries.map((account, index) => {
            const linkedDate = account.linkedAt && !Number.isNaN(Date.parse(account.linkedAt))
                ? new Date(account.linkedAt).toLocaleDateString('fr-FR')
                : 'Date inconnue';
            return `**${(requestedPage - 1) * pageSize + index + 1}. <@${account.discordId}>** — [${account.robloxUsername}](${account.profileUrl}) · lié le ${linkedDate}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`🔗 Comptes Roblox liés • ${interaction.guild.name}`)
            .setDescription(description)
            .setFooter({ text: `Page ${requestedPage}/${totalPages} • ${entries.length} compte${entries.length > 1 ? 's' : ''} lié${entries.length > 1 ? 's' : ''}` })
            .setColor(0x00A2FF);

        return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }

    if (commandName === 'unlinkroblox') {
        const linked = getLinkedRobloxAccount(interaction.guild.id, interaction.user.id);
        if (!linked) {
            return await interaction.reply({
                content: '⚠️ Tu n’as pas de compte Roblox lié à retirer.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const linkedRole = findRobloxLinkedRole(interaction.guild);

        if (linkedRole) {
            try {
                await interaction.member.roles.remove(linkedRole);
            } catch (err) {
                console.error('Impossible de retirer le rôle Roblox lié :', err);
            }
        }

        removeLinkedRobloxAccount(interaction.guild.id, interaction.user.id);

        return await interaction.reply({
            content: '✅ Le lien Roblox a bien été supprimé de ton compte Discord.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    // --- /SETLOGS ---
    if (commandName === 'setlogs') {
        const salon = options.getChannel('salon');
        
        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }
        
        savedConfigs[interaction.guild.id].logChannelId = salon.id;
        saveConfigsToFile();

        const logEmbed = new EmbedBuilder()
            .setTitle('📋 Salon de logs configuré')
            .setDescription(`Ce salon a été défini avec succès comme le canal de logs officiel par ${interaction.user}.`)
            .setColor(0x00FF00)
            .setTimestamp();

        await salon.send({ embeds: [logEmbed] });
        return await interaction.reply({ content: `✅ Le salon de logs a été défini sur ${salon} !`, flags: [MessageFlags.Ephemeral] });
    }

    if (commandName === 'logquest') {
        const salon = options.getChannel('salon');
        const role = options.getRole('role');

        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        savedConfigs[interaction.guild.id].questLogChannelId = salon.id;
        savedConfigs[interaction.guild.id].logChannelId = salon.id;
        savedConfigs[interaction.guild.id].questPingRoleId = role.id;
        saveConfigsToFile();

        return await interaction.reply({
            content: `✅ Le salon de logs principal est maintenant défini sur ${salon}. Tous les logs du bot, y compris les quêtes, y seront envoyés, et le rôle ${role} sera pingé lors des événements importants.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'passerquete') {
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Cette commande est réservée aux administrateurs du serveur.', flags: [MessageFlags.Ephemeral] });
        }

        const target = options.getUser('membre');
        const { data, state, storageKey } = getQuestState(target.id, interaction.guild.id);
        if (!state.started) {
            return await interaction.reply({ content: `❌ ${target} doit d’abord utiliser /quest pour démarrer son parcours.`, flags: [MessageFlags.Ephemeral] });
        }

        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const currentQuest = guildQuests[state.currentQuest];
        if (!currentQuest || state.completed) {
            return await interaction.reply({ content: `❌ ${target} a déjà terminé toutes les quêtes.`, flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const nextQuestNumber = state.currentQuest + 1;
        const nextQuest = guildQuests[nextQuestNumber];
        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.messageCount = 0;
        state.voiceSeconds = 0;
        state.inviteCount = 0;
        state.completed = !nextQuest;
        data[storageKey] = state;
        saveQuestsData(data);

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (targetMember) {
            await grantQuestRoleReward(interaction.guild, targetMember, currentQuest.reward, currentQuest.roleId);
        }

        const logEmbed = new EmbedBuilder()
            .setTitle('⏭️ Quête passée par un administrateur')
            .setDescription(`${interaction.user} a utilisé /passerquete pour faire passer ${target} à la quête suivante.`)
            .addFields(
                { name: 'Quête passée', value: `Niveau ${state.currentQuest - 1} : **${currentQuest.title}**`, inline: false },
                { name: 'Progression', value: nextQuest ? `Niveau ${nextQuestNumber} : **${nextQuest.title}**` : 'Toutes les quêtes sont terminées.', inline: false }
            )
            .setColor(0xF0A500)
            .setTimestamp();

        const logged = await sendQuestLog(interaction.guild, logEmbed);
        const resultText = nextQuest
            ? `✅ ${target} passe maintenant au niveau ${nextQuestNumber} : **${nextQuest.title}**.`
            : `✅ ${target} a terminé toutes les quêtes.`;
        return await interaction.editReply(logged
            ? resultText
            : `${resultText}\n⚠️ Aucun salon de logs de quêtes n’est configuré ou accessible. Configure-le avec /logquest.`);
    }

    if (commandName === 'setproof') {
        const salon = options.getChannel('salon');

        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        savedConfigs[interaction.guild.id].proofChannelId = salon.id;
        saveConfigsToFile();

        return await interaction.reply({
            content: `✅ Le salon de preuves est maintenant défini sur ${salon}. Les quêtes SchoolRP demanderont une preuve avant validation.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'setspecialquest') {
        const salon = options.getChannel('salon');
        const role = options.getRole('role');

        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        savedConfigs[interaction.guild.id].specialQuestChannelId = salon.id;
        savedConfigs[interaction.guild.id].specialQuestRoleId = role.id;
        saveConfigsToFile();

        const data = loadSpecialQuestsData();
        const guildState = getSpecialGuildState(data, interaction.guild.id);
        guildState.channelId = salon.id;
        guildState.specialQuestRoleId = role.id;
        if (guildState.offers.length === 0 && !guildState.nextSpawnAt) {
            guildState.nextSpawnAt = Date.now() + getRandomSpecialSpawnDelay();
        }
        saveSpecialQuestsData(data);

        return await interaction.reply({
            content: `✅ Les quêtes spéciales apparaîtront dans ${salon}, avec une mention de ${role}.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'quetespeciales') {
        const action = options.getString('action');
        const data = loadSpecialQuestsData();
        const guildState = getSpecialGuildState(data, interaction.guild.id);
        const guildConfig = savedConfigs[interaction.guild.id] || {};
        guildState.channelId = guildState.channelId || guildConfig.specialQuestChannelId;

        if (action === 'desactiver') {
            guildState.enabled = false;
            saveSpecialQuestsData(data);
            return await interaction.reply({
                content: '⏸️ Les nouveaux spawns automatiques sont désactivés. Les quêtes déjà publiées restent actives.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (!guildState.channelId) {
            return await interaction.reply({
                content: '⚠️ Configure d’abord le salon et le rôle avec /setspecialquest.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (action === 'activer') {
            const wasDisabled = !guildState.enabled;
            guildState.enabled = true;
            if (wasDisabled && guildState.nextSpawnAt <= Date.now()) {
                guildState.nextSpawnAt = Date.now() + getRandomSpecialSpawnDelay();
            }
            saveSpecialQuestsData(data);
            return await interaction.reply({
                content: '✅ Les apparitions automatiques de quêtes spéciales sont activées.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const isTestSpawn = action === 'lancer_test';
        const spawned = await spawnSpecialQuest(
            interaction.guild,
            guildState,
            data,
            isTestSpawn ? TEST_LEGENDARY_QUEST_NUMBER : null
        );
        return await interaction.reply({
            content: spawned
                ? isTestSpawn
                    ? '✅ La quête légendaire de test (#51) a été publiée.'
                    : '✅ Une quête spéciale a été publiée immédiatement.'
                : isTestSpawn
                    ? '⚠️ La quête de test est déjà terminée, déjà publiée ou le salon de quêtes spéciales est inaccessible.'
                    : '⚠️ Aucune quête spéciale n’est disponible à lancer pour le moment.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'setquestvalidatorrole') {
        const role = options.getRole('role');

        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        const currentRoles = Array.isArray(savedConfigs[interaction.guild.id].questValidatorRoleIds)
            ? savedConfigs[interaction.guild.id].questValidatorRoleIds
            : [];

        if (!currentRoles.includes(role.id)) {
            currentRoles.push(role.id);
        }

        savedConfigs[interaction.guild.id].questValidatorRoleIds = currentRoles;
        saveConfigsToFile();

        return await interaction.reply({
            content: `✅ Le rôle ${role} peut désormais valider les quêtes.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'resetquest') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Cette commande est réservée aux administrateurs du serveur.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const members = await interaction.guild.members.fetch().catch(() => null);
        if (!members) {
            return await interaction.editReply('❌ Impossible de récupérer les membres du serveur. Aucune progression n’a été modifiée.');
        }

        const data = loadQuestsData();
        const guildPrefix = `${interaction.guild.id}:`;
        const resetState = {
            currentQuest: 1,
            progress: 0,
            completed: false,
            started: false,
            messageCount: 0,
            voiceSeconds: 0,
            inviteCount: 0
        };
        const resetUserIds = new Set();

        for (const key of Object.keys(data)) {
            if (key.startsWith(guildPrefix)) {
                data[key] = { ...resetState };
                resetUserIds.add(key.slice(guildPrefix.length));
            }
        }

        for (const [userId, member] of members) {
            if (!member.user.bot && data[userId] && typeof data[userId] === 'object') {
                data[`${guildPrefix}${userId}`] = { ...resetState };
                resetUserIds.add(userId);
            }
        }

        saveQuestsData(data);
        return await interaction.editReply(`✅ Progression des quêtes remise à zéro pour ${resetUserIds.size} membre(s). Ils devront utiliser /quest pour recommencer.`);
    }

    if (commandName === 'config' || commandName === 'admin') {
        return await interaction.reply({
            embeds: [buildConfigPanelEmbed(commandName === 'admin' ? 'admin' : 'home', interaction.guild.id)],
            components: buildConfigPanelComponents(commandName === 'admin' ? 'admin' : 'home', interaction.guild.id),
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'level') {
        await interaction.deferReply(); // <--- AJOUTE ÇA ICI
        const target = options.getUser('membre') || interaction.user;
        const levelsData = loadLevelsData();
        const record = levelsData[interaction.guild.id]?.[target.id] || { xp: 0 };
        const totalXp = Math.max(0, Number(record.xp) || 0);
        const progress = getLevelProgress(totalXp);
        const settings = getLevelSettings(interaction.guild.id);
        const targetName = getCanvasDisplayName(target);
        const rank = getLevelRank(interaction.guild.id, target.id);
        const image = await createLevelCardImage({
            user: target,
            displayName: targetName,
            rank,
            level: progress.level,
            totalXp,
            settings
        });
        const fileName = `level-${target.id}.png`;
        const attachment = new AttachmentBuilder(image, { name: fileName });
        return await interaction.editReply({ files: [attachment] }); // Utilise editReply
    }

    if (commandName === 'toplevel') {
        await interaction.deferReply(); // <--- AJOUTE ÇA ICI AUSSI
        const levelsData = loadLevelsData();
        const guildLevels = levelsData[interaction.guild.id] || {};
        const rankedEntries = Object.entries(guildLevels)
            .map(([userId, record]) => ({
                userId,
                xp: Math.max(0, Number(record?.xp) || 0),
                ...getLevelProgress(record?.xp)
            }))
            .sort((a, b) => b.level - a.level || b.currentXp - a.currentXp)
            .slice(0, 10);
        const rows = await Promise.all(rankedEntries.map(async (entry, index) => {
            const user = await client.users.fetch(entry.userId).catch(() => null);
            return { ...entry, rank: index + 1, displayName: user ? getCanvasDisplayName(user) : 'Utilisateur inconnu' };
        }));
        const currentRank = rankedEntries.findIndex(entry => entry.userId === interaction.user.id) + 1;
        const image = await createTopLevelsImage(rows, currentRank, getTopLevelsSettings(interaction.guild.id));
        const attachment = new AttachmentBuilder(image, { name: 'top-levels.png' });
        return await interaction.editReply({ files: [attachment] }); // <--- REMPLACE reply PAR editReply ICI AUSSI
    }
    if (commandName === 'dropadmin') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        try {
            const target = options.getUser('membre');
            const type = options.getString('type');
            const amount = options.getInteger('montant');
            const data = loadLevelsData();
            const record = getLevelRecord(data, interaction.guild.id, target.id);
            const oldLevel = getLevelProgress(record.xp).level;

            if (type === 'xp') {
                record.xp += amount;
            } else {
                record.xp = Math.max(record.xp, totalXpForLevel(oldLevel + amount));
            }

            const newLevel = getLevelProgress(record.xp).level;
            saveLevelsData(data);
            if (newLevel > oldLevel) {
                await grantLevelRewards(interaction.guild, target.id, oldLevel, newLevel);
                await sendLevelUpAnnouncement(
                    interaction.guild,
                    target,
                    target.globalName || target.username,
                    oldLevel,
                    newLevel,
                    record.xp
                );
            }
            return await interaction.editReply(
                `✅ ${target} reçoit **${amount.toLocaleString('fr-FR')} ${type === 'xp' ? 'XP' : 'niveau(x)'}**. Niveau actuel : **${newLevel}**.`
            );
        } catch (err) {
            console.error('Erreur lors de l’attribution d’XP ou de niveaux via /dropadmin :', err);
            return await interaction.editReply('❌ Impossible de terminer /dropadmin. Aucune confirmation de succès n’a été envoyée ; vérifie les logs du bot.');
        }
    }

    if (commandName === 'quest' || commandName === 'quete') {
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont actuellement désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const { data, state } = getQuestState(interaction.user.id, interaction.guild.id);
        const questChannel = await getNormalQuestChannel(interaction.guild);
        if (!questChannel) {
            return await interaction.editReply('⚠️ Le salon des quêtes normales n’est pas configuré ou accessible. Un administrateur doit le choisir dans `/config` → Quêtes.');
        }

        if (!state.started) {
            const introEmbed = new EmbedBuilder()
                .setTitle('🎯 Bienvenue dans les quêtes de la famille BMF')
                .setDescription('Bienvenue dans les missions de la famille BMF. Ici, chaque action compte : ton activité, ton implication, ton énergie, et ton esprit de groupe permettent de faire grandir la famille et de gagner des récompenses dignes de la BMF.\n\nTu vas avancer au fil de tes quêtes, compléter des missions selon ton activité, et débloquer des récompenses qui renforcent ta place au sein de la famille.')
                .setColor(0x8B3A3A);

            const storageKey = getQuestStorageKey(interaction.user.id, interaction.guild.id);
            data[storageKey] = { ...state, started: true, currentQuest: 1, progress: 0, completed: false };
            saveQuestsData(data);

            const sent = await sendNormalQuestMessage(interaction.guild, {
                content: `${interaction.user}`,
                embeds: [introEmbed],
                components: [buildQuestOwnerButtons(interaction.user.id, { start: true })],
                allowedMentions: { users: [interaction.user.id] }
            });
            return await interaction.editReply(sent
                ? `✅ La présentation de ton parcours a été publiée dans ${questChannel}. Les boutons sont réservés pour toi.`
                : '❌ Impossible de publier dans le salon des quêtes. Vérifie ses permissions puis réessaie avec `/quest`.');
        }

        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const currentQuest = guildQuests[state.currentQuest];
        const sent = await sendNormalQuestMessage(interaction.guild, {
            content: `${interaction.user}`,
            embeds: [buildNormalQuestProgressEmbed(interaction.user, state, guildQuests)],
            components: [buildQuestOwnerButtons(interaction.user.id, {
                proof: currentQuest ? isProofQuest(currentQuest) : false,
                validateQuestNumber: state.currentQuest
            })],
            allowedMentions: { users: [interaction.user.id] }
        });
        return await interaction.editReply(sent
            ? `✅ Ta progression a été publiée dans ${questChannel}. Utilise les boutons de ton message.`
            : '❌ Impossible de publier ta progression. Vérifie les permissions du salon puis réessaie avec `/quest`.');
    }

    if (commandName === 'quetes') {
        const action = options.getString('action');
        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        const enabled = action === 'activer';
        savedConfigs[interaction.guild.id].normalQuestsEnabled = enabled;
        saveConfigsToFile();

        const guildVoicePrefix = `${interaction.guild.id}:`;
        for (const key of voiceQuestStart.keys()) {
            if (key.startsWith(guildVoicePrefix)) {
                voiceQuestStart.delete(key);
            }
        }

        if (enabled) {
            for (const channel of interaction.guild.channels.cache.values()) {
                if (!channel.isVoiceBased()) continue;
                for (const member of channel.members.values()) {
                    if (!member.user.bot) {
                        voiceQuestStart.set(getVoiceQuestKey(member.id, interaction.guild.id), Date.now());
                    }
                }
            }
        }

        return await interaction.reply({
            content: enabled
                ? '✅ Les quêtes normales sont activées sur ce serveur.'
                : '⏸️ Les quêtes normales sont désactivées. Les progressions sont conservées et reprendront à la réactivation.',
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (commandName === 'topquetes') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        try {
            if (!interaction.channel?.isTextBased() || !interaction.channel.isSendable()) {
                return await interaction.editReply('❌ Le classement ne peut pas être publié dans ce salon.');
            }

            const data = loadQuestsData();
            const rankedEntries = Object.entries(data)
                .filter(([, value]) => value && typeof value === 'object')
                .map(([key, value]) => {
                    const [guildId, userId] = String(key).split(':');
                    return {
                        guildId,
                        userId: userId || key,
                        currentQuest: Number(value.currentQuest) || 1,
                        progress: Number(value.progress) || 0,
                        completed: Boolean(value.completed)
                    };
                })
                .filter(entry => !entry.guildId || entry.guildId === interaction.guild.id)
                .sort((a, b) => b.currentQuest - a.currentQuest || b.progress - a.progress);
            const entries = rankedEntries.slice(0, 10);

            const leaderboardRows = await Promise.all(entries.map(async entry => {
                try {
                    const user = await client.users.fetch(entry.userId);
                    return { displayName: getCanvasDisplayName(user), currentQuest: entry.currentQuest };
                } catch {
                    return { displayName: 'Utilisateur inconnu', currentQuest: entry.currentQuest };
                }
            }));

            const userRank = rankedEntries.findIndex(entry => entry.userId === interaction.user.id) + 1;
            const boardImage = await createQuestLeaderboardImage(
                leaderboardRows,
                userRank,
                undefined,
                getQuestLeaderboardSettings(interaction.guild.id)
            );
            await interaction.channel.send({
                files: [new AttachmentBuilder(boardImage, { name: 'classement-quetes.png' })]
            });
            return await interaction.editReply(`✅ Le classement a été publié dans ${interaction.channel}.`);
        } catch (err) {
            console.error(`Erreur lors de la création du classement des quêtes pour ${interaction.guild.id} :`, err);
            return await interaction.editReply('❌ Impossible de publier le classement des quêtes dans ce salon. Vérifie les permissions du bot ; le problème a été enregistré dans les logs.');
        }
    }

    if (commandName === 'questlist') {
        const questsLines = Object.entries(getNormalQuestsConfig(interaction.guild.id))
            .map(([questNumber, quest]) => {
                const levelLabel = `Quête ${questNumber}`;
                let objectiveText = quest.goal ? `${quest.goal}` : 'Objectif';

                if (quest.type === 'voice') {
                    objectiveText = `${quest.goal} min`;
                } else if (quest.type === 'hybrid') {
                    const goals = getHybridQuestGoals(quest);
                    objectiveText = `${goals.messageGoal} messages + ${Math.floor(goals.voiceSecondsGoal / 60)} min vocal`;
                } else if (quest.type === 'invite') {
                    objectiveText = `${quest.goal} invitation${quest.goal > 1 ? 's' : ''}`;
                } else if (quest.type === 'manual') {
                    objectiveText = 'Validation manuelle';
                } else if (quest.type === 'reaction') {
                    objectiveText = `${quest.goal} réactions`;
                }

                return `**${levelLabel}** • ${quest.title} — ${objectiveText} — ${getQuestRewardDisplay(quest)}`.slice(0, 350);
            });

        const questEmbeds = [];
        for (let index = 0; index < questsLines.length; index += 10) {
            const page = Math.floor(index / 10) + 1;
            const totalPages = Math.ceil(questsLines.length / 10);
            questEmbeds.push(new EmbedBuilder()
                .setTitle(totalPages > 1 ? `📜 Liste des quêtes (${page}/${totalPages})` : '📜 Liste des quêtes')
                .setDescription(questsLines.slice(index, index + 10).join('\n'))
                .setColor(0x8B3A3A));
        }

        return await interaction.reply({ embeds: questEmbeds });
    }

    if (commandName === 'soldejetons') {
        const tokenData = loadTokensData();
        const wallet = getTokenWallet(tokenData, interaction.guild.id, interaction.user.id);
        saveTokensData(tokenData);
        return await interaction.reply({
            content: `🪙 Tu possèdes **${wallet.balance} jetons**.\nUn tour de roulette supplémentaire coûte **${getTokenEconomySettings(interaction.guild.id).spinCost} jetons**.`,
        });
    }

    if (commandName === 'quotidien') {
        const claim = claimDailyTokens(interaction.guild.id, interaction.user.id);
        if (!claim.claimed) {
            return await interaction.reply({
                content: `⏳ Tu as déjà récupéré tes jetons aujourd’hui. Ta série actuelle est de **${claim.streak || 0} jour(s)**.`
            });
        }
        return await interaction.reply({
            content: `🪙 Tu récupères **${claim.reward} jetons** pour ta connexion quotidienne ! Série : **${claim.streak} jour(s)**.\nSolde : **${claim.balance} jetons**.`
        });
    }

    if (commandName === 'boutique') {
        const { state } = getRouletteState(interaction.user.id, interaction.guild.id);
        const tokenData = loadTokensData();
        const wallet = getTokenWallet(tokenData, interaction.guild.id, interaction.user.id);
        saveTokensData(tokenData);
        const economySettings = getTokenEconomySettings(interaction.guild.id);
        const spinsAvailable = Math.max(0, economySettings.maxPaidSpins - state.purchasedSpins);
        const selectMenu = buildRouletteShopSelect(economySettings.maxPaidSpins, interaction.guild.id);
        return await interaction.reply({
            embeds: [buildRouletteShopEmbed(wallet.balance, spinsAvailable, interaction.guild.id)],
            components: selectMenu ? [new ActionRowBuilder().addComponents(selectMenu)] : []
        });
    }

    if (commandName === 'setdropjetons') {
        const channel = options.getChannel('salon');
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Cette commande est réservée aux administrateurs.' });
        }
        if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
        if (channel) {
            savedConfigs[interaction.guild.id].tokenDropChannelId = channel.id;
            savedConfigs[interaction.guild.id].nextTokenDropAt = Date.now() + getRandomTokenDropDelay();
        } else {
            delete savedConfigs[interaction.guild.id].tokenDropChannelId;
            delete savedConfigs[interaction.guild.id].nextTokenDropAt;
        }
        saveConfigsToFile();
        return await interaction.reply({
            content: channel
                ? `✅ Les cadeaux automatiques de jetons seront publiés dans ${channel}, à intervalles aléatoires de 24 à 72 heures.`
                : '✅ Les cadeaux automatiques de jetons sont désactivés.'
        });
    }

    if (commandName === 'dropjetons') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return await interaction.reply({ content: '❌ Il faut la permission « Gérer le serveur » pour lancer un cadeau.' });
        }
        const channel = options.getChannel('salon') || interaction.channel;
        const amount = options.getInteger('montant') || 100;
        if (!channel?.isTextBased() || typeof channel.send !== 'function') {
            return await interaction.reply({ content: '❌ Choisis un salon textuel pour le cadeau.' });
        }
        const activeDrop = loadTokensData()[interaction.guild.id]?.activeDrop;
        if (activeDrop && !activeDrop.claimedBy && Number(activeDrop.expiresAt) > Date.now()) {
            return await interaction.reply({ content: '⏳ Un cadeau de jetons est déjà en cours sur ce serveur.' });
        }
        try {
            const dropMessage = await publishTokenDrop(interaction.guild, channel, amount);
            if (!dropMessage) {
                return await interaction.reply({ content: '⏳ Un cadeau de jetons est déjà en cours sur ce serveur.' });
            }
        } catch (err) {
            console.error('Impossible de publier le cadeau manuel de jetons :', err);
            return await interaction.reply({
                content: '❌ Le cadeau n’a pas pu être publié. Vérifie que le bot peut envoyer des messages et ajouter des réactions dans ce salon.'
            });
        }
        return await interaction.reply({
            content: `✅ Le cadeau de **${amount} jetons** est lancé dans ${channel} !`
        });
    }

    if (commandName === 'resetroulette') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '❌ Cette commande est réservée aux administrateurs.'
            });
        }

        const target = options.getUser('membre') || interaction.user;
        const rouletteData = loadRouletteData();
        const key = getQuestStorageKey(target.id, interaction.guild.id);
        const existingState = rouletteData[key] || {};
        const state = {
            ...existingState,
            spinsUsed: 0,
            bonusSpins: 0,
            lastResetAt: Date.now()
        };
        rouletteData[key] = state;
        saveRouletteData(rouletteData);

        return await interaction.reply({
            content: `✅ Les tours de roulette de ${target} ont été réinitialisés. Il/elle peut maintenant relancer la roulette.`,
            allowedMentions: { users: [] }
        });
    }

    if (commandName === 'roulette' || commandName === 'spin') {
        const rouletteKey = getQuestStorageKey(interaction.user.id, interaction.guild.id);
        try {
        const { state } = getRouletteState(interaction.user.id, interaction.guild.id);

        const reward = pickRouletteReward();
        const rouletteData = loadRouletteData();
        rouletteData[rouletteKey] = state;
        saveRouletteData(rouletteData);

        let resultText = `🎉 Tu as gagné **${reward.label}** !`;
        let loggedReward = reward.label;

        if (reward.type === 'role') {
            const luckyRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'lucky');
            if (luckyRole) {
                try {
                    await interaction.member.roles.add(luckyRole);
                    resultText = `🎉 Tu as gagné le rôle **Lucky** !`;
                } catch (err) {
                    resultText = `🎉 Tu as gagné le rôle **Lucky**, mais je n’ai pas pu le lui attribuer automatiquement.`;
                }
            } else {
                resultText = `🎉 Tu as gagné le rôle **Lucky**, mais le rôle n’existe pas encore sur le serveur.`;
            }
        } else if (reward.type === 'bonus_spin') {
            state.bonusSpins += Number(reward.value);
            resultText = `🎉 Tu as gagné **${reward.value} tour bonus** ! Tu peux rejouer immédiatement.`;
        } else if (reward.type === 'xp') {
            const xpAmount = Math.max(0, Math.floor(Number(reward.value) || 0));
            const { record, oldLevel, newLevel } = addLevelXp(
                interaction.guild.id,
                interaction.user.id,
                xpAmount
            );
            if (newLevel > oldLevel) {
                await grantLevelRewards(interaction.guild, interaction.user.id, oldLevel, newLevel);
                await sendLevelUpAnnouncement(
                    interaction.guild,
                    interaction.user,
                    getCanvasDisplayName(interaction.user),
                    oldLevel,
                    newLevel,
                    record.xp
                );
                resultText = `🎉 Tu as gagné **${xpAmount} XP** et tu passes au **niveau ${newLevel}** !`;
            } else {
                resultText = `🎉 Tu as gagné **${xpAmount} XP** !`;
            }
        } else if (reward.type === 'unique_role') {
            try {
                const roleName = buildUniqueRouletteRoleName(interaction.guild);
                const role = await interaction.guild.roles.create({
                    name: roleName,
                    color: 0x9B59B6,
                    reason: `${interaction.user.tag} a remporté un rôle exclusif à la roulette`
                });
                await interaction.member.roles.add(role);
                loggedReward = role.name;
                resultText = `🎉 Tu as gagné le rôle exclusif **${role.name}** ! Tu le gardes sur ton profil. Un nouveau rôle sera créé pour le prochain gagnant.`;
            } catch (err) {
                console.error(`Impossible d’attribuer le rôle exclusif de roulette à ${interaction.user.id} :`, err);
                resultText = '🎉 Tu as gagné le rôle exclusif de la roulette, mais le bot n’a pas pu le créer ou l’attribuer. Vérifie sa permission « Gérer les rôles » et la position de son rôle.';
            }
        }
        rouletteData[rouletteKey] = state;
        saveRouletteData(rouletteData);

        await interaction.editReply({
            embeds: [buildRouletteWheel(ROULETTE_REWARDS, 0)]
        });
        const wheelMessage = await interaction.fetchReply();

        for (let i = 1; i <= 8; i++) {
            await sleep(220);
            try {
                await wheelMessage.edit({
                    embeds: [buildRouletteWheel(ROULETTE_REWARDS, i)]
                });
            } catch (err) {
                console.error(`Erreur pendant l’animation de roulette pour ${interaction.user.id} :`, err);
                break;
            }
        }

        const finalWheel = buildRouletteWheel(
            ROULETTE_REWARDS,
            ROULETTE_REWARDS.findIndex(item => item.label === reward.label),
            resultText
        );
        try {
            await wheelMessage.edit({ embeds: [finalWheel] });
        } catch (err) {
            console.error(`Impossible d’afficher le résultat de roulette dans le message initial pour ${interaction.user.id} :`, err);
            try {
                await interaction.followUp({ embeds: [finalWheel] });
            } catch (followUpError) {
                console.error(`Impossible d’envoyer le résultat de roulette en secours pour ${interaction.user.id} :`, followUpError);
            }
        }

        const rouletteLogEmbed = new EmbedBuilder()
            .setTitle('🎰 Roulette gagnée')
            .setDescription(`${interaction.user} a remporté **${loggedReward}** à la roulette.`)
            .addFields(
                { name: '🎁 Lot remporté', value: loggedReward, inline: true },
                { name: '📍 Salon', value: `${interaction.channel}`, inline: true },
                { name: '🕒 Date', value: new Date().toLocaleString('fr-FR'), inline: true }
            )
            .setColor(0xFFD700)
            .setTimestamp();

        try {
            await sendQuestLog(interaction.guild, rouletteLogEmbed);
        } catch (err) {
            console.error(`Impossible d’envoyer le log du gain de roulette (${interaction.user.id}) :`, err);
        }

        return;
        } catch (err) {
            console.error(`Erreur lors du tour de roulette de ${interaction.user.id} sur ${interaction.guild.id} :`, err);
            try {
                await interaction.editReply({
                    content: '❌ Une erreur a interrompu ce tour de roulette. Le problème a été enregistré dans les logs du bot ; contacte le staff avant de relancer.'
                });
            } catch (replyError) {
                console.error(`Impossible d’afficher l’erreur du tour de roulette pour ${interaction.user.id} :`, replyError);
            }
        } finally {
            rouletteSpinsInProgress.delete(rouletteKey);
        }
    }

    if (commandName === 'validermanuel') {
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        const target = options.getUser('membre');
        const { data, state } = getQuestState(target.id, interaction.guild.id);
        if (!state.started) {
            return await interaction.reply({ content: `❌ ${target.tag} doit d’abord lancer /quest avant de pouvoir progresser dans les quêtes.`, flags: [MessageFlags.Ephemeral] });
        }

        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const currentQuest = guildQuests[state.currentQuest];

        if (!currentQuest || currentQuest.type !== 'manual') {
            return await interaction.reply({ content: `❌ ${target.tag} n’a pas de quête manuelle active pour le moment.`, flags: [MessageFlags.Ephemeral] });
        }

        const nextQuestNumber = state.currentQuest + 1;
        const nextQuest = guildQuests[nextQuestNumber];

        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.completed = !nextQuest;
        state.started = true;
        data[getQuestStorageKey(target.id, interaction.guild.id)] = state;
        saveQuestsData(data);

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (targetMember) {
            await grantQuestRoleReward(interaction.guild, targetMember, currentQuest.reward, currentQuest.roleId);
        }

        const questLogEmbed = new EmbedBuilder()
            .setTitle('✅ Quête manuelle validée')
            .setDescription(`${target} a validé la quête **${currentQuest.title}** via validation manuelle par ${interaction.user}.`)
            .addFields(
                { name: '🏆 Récompense', value: getQuestRewardDisplay(currentQuest), inline: false },
                { name: '➡️ Prochaine quête', value: nextQuest ? `${nextQuest.title}` : 'Fin du parcours', inline: false }
            )
            .setColor(0x00FF7F)
            .setTimestamp();

        await sendQuestLog(interaction.guild, questLogEmbed);
        return await interaction.reply({ content: `✅ La quête manuelle **${currentQuest.title}** a bien été validée pour ${target}.`, flags: [MessageFlags.Ephemeral] });
    }

    // --- /BAN ---
    if (commandName === 'ban') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const targetUser = options.getUser('membre');
        const raison = options.getString('raison');
        const targetMember = options.getMember('membre');

        if (!targetMember || !targetMember.bannable) {
            return interaction.editReply({ content: "Impossible de bannir ce membre." });
        }

        await sendMP(targetUser, `🚨 **Vous avez été banni de ${interaction.guild.name}**\n**Raison :** ${raison}`);
        await targetMember.ban({ reason: raison });
        await interaction.editReply({ content: `🔨 **${targetUser.tag}** a été banni.\nRaison : ${raison}` });

        const logEmbed = new EmbedBuilder()
            .setTitle('🔨 Membre Banni')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Utilisateur', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: false },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }

    // --- /UNBAN ---
    if (commandName === 'unban') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const userId = options.getString('id');

        try {
            const user = await client.users.fetch(userId);
            await interaction.guild.members.unban(userId);
            await interaction.editReply({ content: `✅ L'utilisateur avec l'ID \`${userId}\` a été débanni avec succès.` });

            const logEmbed = new EmbedBuilder()
                .setTitle('🔓 Membre Débanni')
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (\`${userId}\`)`, inline: false },
                    { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);
        } catch (error) {
            await interaction.editReply({ content: `❌ Impossible de débannir cet utilisateur. Vérifie l'ID.` });
        }
    }

    // --- /KICK ---
    if (commandName === 'kick') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const targetUser = options.getUser('membre');
        const raison = options.getString('raison');
        const targetMember = options.getMember('membre');

        if (!targetMember || !targetMember.kickable) {
            return interaction.editReply({ content: "Impossible d'expulser ce membre." });
        }

        await sendMP(targetUser, `⚠️ **Vous avez été expulsé de ${interaction.guild.name}**\n**Raison :** ${raison}`);
        await targetMember.kick(raison);
        await interaction.editReply({ content: `👢 **${targetUser.tag}** a été expulsé.\nRaison : ${raison}` });

        const logEmbed = new EmbedBuilder()
            .setTitle('👢 Membre Expulsé')
            .setColor(0xFFA500)
            .addFields(
                { name: 'Utilisateur', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: false },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }

    // --- /WARN ---
    if (commandName === 'warn') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const targetUser = options.getUser('membre');
        const raison = options.getString('raison');
        const targetMember = options.getMember('membre');

        if (!targetMember) return interaction.editReply({ content: "Membre introuvable." });

        const userId = targetUser.id;
        if (!warns.has(userId)) warns.set(userId, 0);
        
        let currentWarns = warns.get(userId) + 1;
        warns.set(userId, currentWarns);

        let warnRole = '';
        if (currentWarns === 1) warnRole = ROLES.WARN_1;
        else if (currentWarns === 2) warnRole = ROLES.WARN_2;
        else if (currentWarns >= 3) warnRole = ROLES.WARN_3;

        await sendMP(targetUser, `⚠️ **Avertissement n°${currentWarns} sur ${interaction.guild.name}**\n**Raison :** ${raison}`);

        if (warnRole) {
            try {
                await targetMember.roles.remove([ROLES.WARN_1, ROLES.WARN_2, ROLES.WARN_3]);
                await targetMember.roles.add(warnRole);
            } catch (err) { console.error("Erreur de rôles :", err); }
        }

        await interaction.editReply({ content: `⚠️ **${targetUser.tag}** a reçu l'avertissement n°${currentWarns}.\nRaison : ${raison}` });

        const logEmbed = new EmbedBuilder()
            .setTitle('⚠️ Avertissement (Warn)')
            .setColor(0xFFCC00)
            .addFields(
                { name: 'Utilisateur', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: false },
                { name: 'Nombre de warns', value: `${currentWarns}`, inline: true },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }

    // --- /TEMPMUTE ---
    if (commandName === 'tempmute') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const targetUser = options.getUser('membre');
        const duree = options.getInteger('duree');
        const raison = options.getString('raison');
        const targetMember = options.getMember('membre');

        if (!targetMember || !targetMember.moderatable) {
            return interaction.editReply({ content: "Impossible de mute ce membre." });
        }

        const tempsMs = duree * 60 * 1000;
        await sendMP(targetUser, `🤐 **Vous avez été mute sur ${interaction.guild.name} pendant ${duree} minute(s)**\n**Raison :** ${raison}`);
        
        await targetMember.timeout(tempsMs, raison);
        await interaction.editReply({ content: `🤐 **${targetUser.tag}** a été mute pendant **${duree} minute(s)**.\nRaison : ${raison}` });

        const logEmbed = new EmbedBuilder()
            .setTitle('🤐 Mute Temporaire')
            .setColor(0x808080)
            .addFields(
                { name: 'Utilisateur', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: false },
                { name: 'Durée', value: `${duree} minute(s)`, inline: true },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }

    // --- /UNMUTE ---
    if (commandName === 'unmute') {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const targetUser = options.getUser('membre');
        const targetMember = options.getMember('membre');

        if (!targetMember || !targetMember.moderatable) {
            return interaction.editReply({ content: "Impossible de unmute ce membre." });
        }

        await targetMember.timeout(null);
        await interaction.editReply({ content: `🔊 **${targetUser.tag}** n'est plus mute.` });

        const logEmbed = new EmbedBuilder()
            .setTitle('🔊 Unmute')
            .setColor(0x00FFFF)
            .addFields(
                { name: 'Utilisateur', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: false },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);
    }

    // --- /USERINFO ---
    if (commandName === 'userinfo') {
        const targetMember = options.getMember('membre') || interaction.member;
        const targetUser = targetMember.user;

        const embed = new EmbedBuilder()
            .setTitle(`Informations de ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setColor(0x00AE86)
            .addFields(
                { name: '🆔 ID', value: targetUser.id, inline: true },
                { name: '📅 Compte créé le', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Arrivé sur le serveur le', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
    }

    // --- /CLEAR ---
    if (commandName === 'clear') {
        const nombre = options.getInteger('nombre');
        if (nombre < 1 || nombre > 100) return interaction.reply({ content: "Choisis un nombre entre 1 et 100.", flags: [MessageFlags.Ephemeral] });

        await interaction.channel.bulkDelete(nombre, true);
        await interaction.reply({ content: `🧹 **${nombre} message(s)** supprimé(s).`, flags: [MessageFlags.Ephemeral] });
    }

    // --- /EMBED ---
    if (commandName === 'embed') {
        const nom = options.getString('nom');

        embedBuilders.set(interaction.user.id, {
            mode: 'create',
            name: nom,
            title: 'Titre par défaut',
            description: 'Description par défaut de ton embed.',
            color: '#2B2D31',
            footerText: '',
            footerIcon: '',
            timestamp: false,
            mainImage: '',
            thumbnail: '',
            categoryId: '',
            staffRoleId: '',
            ticketOptions: [
                { label: 'Support / Problème', value: 'probleme', description: 'Ouvrir un ticket pour de l\'aide', emoji: '🔧' },
                { label: 'Recrutement', value: 'recrutement', description: 'Postuler dans l\'équipe', emoji: '📋' }
            ]
        });

        const embedPreview = new EmbedBuilder()
            .setTitle(`Aperçu : ${nom}`)
            .setDescription('Utilise les boutons ci-dessous pour modifier ton embed et configurer les paramètres du ticket.')
            .setColor(0x00FF00);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('edit_basic').setLabel('Edit Basic Info').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('edit_footer').setLabel('Edit Footer').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('edit_images').setLabel('Edit Images').setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('edit_ticket_setup').setLabel('⚙️ Configurer le Ticket').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('publish_embed').setLabel('Envoyer / Terminer').setStyle(ButtonStyle.Success)
        );

        return interaction.reply({ 
            content: `✨ Création de l'embed **${nom}** en cours !`, 
            embeds: [embedPreview], 
            components: [row1, row2], 
            flags: [MessageFlags.Ephemeral] 
        });
    }

    // --- /EDITEMBED ---
    if (commandName === 'editembed') {
        const messageId = options.getString('message_id');
        
        try {
            const message = await interaction.channel.messages.fetch(messageId).catch(() => null);
            if (!message || message.author.id !== client.user.id) {
                return await interaction.reply({ content: `❌ Impossible de trouver ce message dans ce salon (ou ce n'est pas un message envoyé par le bot).`, flags: [MessageFlags.Ephemeral] });
            }

            const existingEmbed = message.embeds[0];
            if (!existingEmbed) {
                return await interaction.reply({ content: `❌ Ce message ne contient aucun embed.`, flags: [MessageFlags.Ephemeral] });
            }

            embedBuilders.set(interaction.user.id, {
                mode: 'edit',
                messageId: messageId,
                channelId: interaction.channel.id,
                title: existingEmbed.title || '',
                description: existingEmbed.description || '',
                color: existingEmbed.hexColor || '#2B2D31',
                footerText: existingEmbed.footer ? existingEmbed.footer.text : '',
                footerIcon: existingEmbed.footer ? existingEmbed.footer.iconURL : '',
                timestamp: !!existingEmbed.timestamp,
                mainImage: existingEmbed.image ? existingEmbed.image.url : '',
                thumbnail: existingEmbed.thumbnail ? existingEmbed.thumbnail.url : '',
                categoryId: '',
                staffRoleId: '',
                ticketOptions: [
                    { label: 'Support / Problème', value: 'probleme', description: 'Ouvrir un ticket pour de l\'aide', emoji: '🔧' },
                    { label: 'Recrutement', value: 'recrutement', description: 'Postuler dans l\'équipe', emoji: '📋' }
                ]
            });

            const embedPreview = new EmbedBuilder()
                .setTitle(`Mode Édition : Message ${messageId}`)
                .setDescription('Utilise les boutons ci-dessous pour modifier ton embed existant. N\'oublie pas de configurer les options de ticket si tu les modifies.')
                .setColor(0x0099FF);

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('edit_basic').setLabel('Edit Basic Info').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('edit_footer').setLabel('Edit Footer').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('edit_images').setLabel('Edit Images').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('edit_ticket_setup').setLabel('⚙️ Configurer le Ticket').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('publish_embed').setLabel('💾 Enregistrer les modifications').setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ 
                content: `✏️ Chargement de l'embed pour modification...`, 
                embeds: [embedPreview], 
                components: [row1, row2], 
                flags: [MessageFlags.Ephemeral] 
            });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: `❌ Erreur lors de la récupération du message. Vérifie bien l'ID.`, flags: [MessageFlags.Ephemeral] });
        }
    }

    // --- /RANKUP ---
    if (commandName === 'rankup') {
        await interaction.deferReply(); // Supprime le flag Ephemeral ici

        const targetMember = options.getMember('membre');
        const role = options.getRole('role');
        const raison = options.getString('raison');

        if (!targetMember) {
            return interaction.editReply({ content: `❌ Membre introuvable.` });
        }

        try {
            await targetMember.roles.add(role);
        } catch (err) {
            return interaction.editReply({ content: `❌ Impossible d'ajouter ce rôle (vérifie la hiérarchie des rôles du bot).` });
        }

        await sendMP(targetMember.user, `🎉 **Félicitations !**\nVous avez été promu au rang de **${role.name}** sur le serveur **${interaction.guild.name}**.\n**Raison :** ${raison}`);
        await interaction.channel.send(`📈 **${targetMember}** a été promu au rang de **${role.name}** !\n*Raison :* ${raison} (Action par ${interaction.user})`);
        const rankupAnnouncementSent = await sendRankupAnnouncement(interaction.guild, targetMember, role, raison);

        const logEmbed = new EmbedBuilder()
            .setTitle('📈 Promotion (Rankup)')
            .setColor(0x00FF00)
            .addFields(
                { name: 'Membre', value: `${targetMember.user.tag}`, inline: true },
                { name: 'Rôle attribué', value: `${role.name}`, inline: true },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);

        return interaction.editReply({
            content: `✅ Rankup effectué avec succès pour ${targetMember.user.tag} !${rankupAnnouncementSent === false ? '\n⚠️ Le rôle a bien été attribué, mais l’annonce automatique n’a pas pu être envoyée. Vérifie le salon configuré et les permissions du bot.' : ''}`
        });
    } // <--- ACCOLADE AJOUTÉE ICI POUR FERMER LE IF RANKUP

    // --- /DERANK ---
    if (commandName === 'derank') {
        await interaction.deferReply(); // Supprime le flag Ephemeral ici

        const targetMember = options.getMember('membre');
        const roleRemove = options.getRole('role_a_retirer');
        const roleAdd = options.getRole('role_a_ajouter'); // Sera null si non renseigné
        const raison = options.getString('raison');

        if (!targetMember) {
            return interaction.editReply({ content: `❌ Membre introuvable.` });
        }

        try {
            await targetMember.roles.remove(roleRemove);
            if (roleAdd) {
                await targetMember.roles.add(roleAdd);
            }
        } catch (err) {
            return interaction.editReply({ content: `❌ Erreur lors de la modification des rôles (vérifie la hiérarchie).` }); // <--- PARENTHÈSE FERMANTE AJOUTÉE ICI
        }

        let mpMessage = "";
        let publicMessage = "";

        if (roleAdd) {
            mpMessage = `📉 **Mise à jour de votre grade**\nVous avez été derank sur le serveur **${interaction.guild.name}**. Vous passez du rôle **${roleRemove.name}** au rôle **${roleAdd.name}**.\n**Raison :** ${raison}`;
            publicMessage = `📉 **${targetMember}** a été derank. Il passe du rôle **${roleRemove.name}** à **${roleAdd.name}**.\n*Raison :* ${raison} (Action par ${interaction.user})`;
        } else {
            mpMessage = `📉 **Mise à jour de votre grade**\nVous avez été derank du rôle **${roleRemove.name}** sur le serveur **${interaction.guild.name}**.\nSi vous pensez que nous avons fait une erreur, faites un ticket.\n**Raison :** ${raison}`;
            publicMessage = `📉 **${targetMember}** a été retiré du rôle **${roleRemove.name}**.\n*Raison :* ${raison} (Action par ${interaction.user})`;
        }

        await sendMP(targetMember.user, mpMessage);
        await interaction.channel.send(publicMessage);

        const logEmbed = new EmbedBuilder()
            .setTitle('📉 Rétrogradation (Derank)')
            .setColor(0xFF0000)
            .addFields(
                { name: 'Membre', value: `${targetMember.user.tag}`, inline: true },
                { name: 'Rôle retiré', value: `${roleRemove.name}`, inline: true },
                { name: 'Rôle ajouté', value: roleAdd ? roleAdd.name : 'Aucun', inline: true },
                { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                { name: 'Raison', value: raison, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);

        return interaction.editReply({ content: `✅ Derank effectué avec succès pour ${targetMember.user.tag} !` }); // <--- PARENTHÈSE FERMANTE CORRIGÉE ICI
    }

    // --- /INVITELOGS ---
    if (commandName === 'invitelogs') {
        const action = options.getString('action');
        const salonChoisi = options.getChannel('salon');

        if (!savedConfigs[interaction.guild.id]) {
            savedConfigs[interaction.guild.id] = {};
        }

        if (action === 'disable') {
            savedConfigs[interaction.guild.id].inviteLogsEnabled = false;
            saveConfigsToFile();

            return await interaction.reply({ 
                content: `❌ Le système de suivi des invitations a été **désactivé**.`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        if (action === 'enable') {
            if (!salonChoisi) {
                return await interaction.reply({ 
                    content: `⚠️ Tu dois spécifier un salon pour activer les logs !`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            savedConfigs[interaction.guild.id].inviteLogChannelId = salonChoisi.id;
            savedConfigs[interaction.guild.id].inviteLogsEnabled = true;
            saveConfigsToFile();

            return await interaction.reply({ 
                content: `✅ Le système de suivi des invitations a été **activé** dans ${salonChoisi} !`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
}); // <-- Fin du bloc client.on de tes commandes slash

// --- ÉCOUTEUR GLOBAL DES INTERACTIONS (Boutons, Modals, Select Menus) ---
client.on('interactionCreate', async interaction => {
    const userId = interaction.user.id;

    // --- 1. COMMANDES SLASH ---
    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction;
        return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('roulette_shop_')) {
        const spinCount = Number(interaction.values[0]);
        const economySettings = getTokenEconomySettings(interaction.guild.id);
        if (!Number.isInteger(spinCount) || spinCount < 1 || spinCount > economySettings.maxPaidSpins) {
            return await interaction.reply({ content: '❌ Pack de tours invalide.' });
        }

        const { state } = getRouletteState(interaction.user.id, interaction.guild.id);
        const spinsAvailable = Math.max(0, economySettings.maxPaidSpins - state.purchasedSpins);
        const price = spinCount * economySettings.spinCost;
        const tokenData = loadTokensData();
        const wallet = getTokenWallet(tokenData, interaction.guild.id, interaction.user.id);

        if (spinCount > spinsAvailable) {
            return await interaction.reply({
                content: `❌ Le nombre de tours demandé dépasse ta limite d’achat restante cette semaine : **${spinsAvailable}**.`,
                embeds: [buildRouletteShopEmbed(wallet.balance, spinsAvailable, interaction.guild.id)]
            });
        }

        if (wallet.balance < price) {
            return await interaction.reply({
                content: `❌ Il te faut **${price} jetons** pour ce pack ; ton solde est de **${wallet.balance} jetons**.`,
                embeds: [buildRouletteShopEmbed(wallet.balance, spinsAvailable, interaction.guild.id)]
            });
        }

        wallet.balance -= price;
        state.purchasedSpins += spinCount;
        state.bonusSpins += spinCount;
        const rouletteData = loadRouletteData();
        rouletteData[getQuestStorageKey(interaction.user.id, interaction.guild.id)] = state;
        saveRouletteData(rouletteData);
        saveTokensData(tokenData);

        return await interaction.reply({
            content: `✅ Achat effectué : **${spinCount} tour${spinCount > 1 ? 's' : ''}** pour **${price} jetons**. Les tours sont disponibles immédiatement.\nSolde restant : **${wallet.balance} jetons**.`,
        });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'config_category_select') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const category = interaction.values[0];
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
            components: buildConfigPanelComponents(category, interaction.guild.id)
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'config_quest_channel') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const channel = interaction.channels.first();
        if (!channel?.isTextBased() || !channel.isSendable()) {
            return await interaction.reply({ content: '❌ Choisis un salon textuel dans lequel le bot peut envoyer des messages.', flags: [MessageFlags.Ephemeral] });
        }
        if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
        savedConfigs[interaction.guild.id].questChannelId = channel.id;
        saveConfigsToFile();
        return await interaction.update({
            embeds: [buildConfigPanelEmbed('quests', interaction.guild.id)],
            components: buildConfigPanelComponents('quests', interaction.guild.id)
        });
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('config_quest_manager_select_')) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const pageNumber = Number(interaction.customId.slice('config_quest_manager_select_'.length)) || 0;
        const questNumber = Number(interaction.values[0]);
        if (!getNormalQuestsConfig(interaction.guild.id)[questNumber]) {
            return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
        }
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`questEditor_${questNumber}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`questEditor_${questNumber}`, interaction.guild.id)
        });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'config_log_module_select') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const key = interaction.values[0];
        if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id)
        });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'config_rankup_role_type') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const roleType = interaction.values[0];
        if (!['test', 'member', 'ping'].includes(roleType)) {
            return await interaction.reply({ content: '❌ Type de rôle inconnu.', flags: [MessageFlags.Ephemeral] });
        }
        rankupRoleSelection.set(`${interaction.guild.id}:${interaction.user.id}`, roleType);
        return await interaction.update({
            embeds: [buildConfigPanelEmbed('admin_rankup', interaction.guild.id)],
            components: buildConfigPanelComponents('admin_rankup', interaction.guild.id)
        });
    }

    if (interaction.isRoleSelectMenu() && interaction.customId === 'config_rankup_role') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const selectionKey = `${interaction.guild.id}:${interaction.user.id}`;
        const roleType = rankupRoleSelection.get(selectionKey);
        if (!roleType) {
            return await interaction.reply({ content: '❌ Choisis d’abord le type de rôle à configurer.', flags: [MessageFlags.Ephemeral] });
        }
        rankupRoleSelection.delete(selectionKey);
        const settingKey = {
            test: 'testRoleId',
            member: 'memberRoleId',
            ping: 'pingRoleId'
        }[roleType];
        saveRankupAnnouncementSettings(interaction.guild.id, { [settingKey]: interaction.values[0] });
        return await interaction.update({
            embeds: [buildConfigPanelEmbed('admin_rankup', interaction.guild.id)],
            components: buildConfigPanelComponents('admin_rankup', interaction.guild.id)
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'config_logs_default_channel') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const settings = getBotLogSettings(interaction.guild.id);
        saveBotLogSettings(interaction.guild.id, { ...settings, defaultChannelId: interaction.values[0] });
        return await interaction.update({
            embeds: [buildConfigPanelEmbed('logs', interaction.guild.id)],
            components: buildConfigPanelComponents('logs', interaction.guild.id)
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId.startsWith('config_log_module_channel_')) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const key = interaction.customId.slice('config_log_module_channel_'.length);
        if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
        const settings = getBotLogSettings(interaction.guild.id);
        settings.modules[key].channelId = interaction.values[0];
        saveBotLogSettings(interaction.guild.id, settings);
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id)
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId.startsWith('config_admin_channel_')) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const key = interaction.customId.slice('config_admin_channel_'.length);
        const page = ADMIN_CONFIG_PAGES[key];
        if (!page?.channelId) return await interaction.reply({ content: '❌ Réglage de salon inconnu.', flags: [MessageFlags.Ephemeral] });

        const channelId = interaction.values[0];
        if (key === 'rankup') {
            saveRankupAnnouncementSettings(interaction.guild.id, { channelId });
        } else {
            if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
            savedConfigs[interaction.guild.id][page.channelId] = channelId;
            if (key === 'invites') savedConfigs[interaction.guild.id].inviteLogsEnabled = true;
            if (key === 'tokens') {
                savedConfigs[interaction.guild.id].nextTokenDropAt = Date.now() + getRandomTokenDropDelay();
            }
            saveConfigsToFile();
        }
        if (key === 'specialquest') {
            const data = loadSpecialQuestsData();
            getSpecialGuildState(data, interaction.guild.id).channelId = channelId;
            saveSpecialQuestsData(data);
        }
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`admin_${key}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`admin_${key}`, interaction.guild.id)
        });
    }

    if (interaction.isRoleSelectMenu() && interaction.customId.startsWith('config_admin_role_')) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const key = interaction.customId.slice('config_admin_role_'.length);
        const roleId = interaction.values[0];
        if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};

        if (key === 'questlogs') {
            savedConfigs[interaction.guild.id].questPingRoleId = roleId;
        } else if (key === 'specialquest') {
            savedConfigs[interaction.guild.id].specialQuestRoleId = roleId;
            const data = loadSpecialQuestsData();
            getSpecialGuildState(data, interaction.guild.id).specialQuestRoleId = roleId;
            saveSpecialQuestsData(data);
        } else if (key === 'validatorrole') {
            const roles = Array.isArray(savedConfigs[interaction.guild.id].questValidatorRoleIds)
                ? savedConfigs[interaction.guild.id].questValidatorRoleIds
                : [];
            if (!roles.includes(roleId)) roles.push(roleId);
            savedConfigs[interaction.guild.id].questValidatorRoleIds = roles;
        } else {
            return await interaction.reply({ content: '❌ Réglage de rôle inconnu.', flags: [MessageFlags.Ephemeral] });
        }

        saveConfigsToFile();
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`admin_${key}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`admin_${key}`, interaction.guild.id)
        });
    }

    if (interaction.isRoleSelectMenu() && interaction.customId.startsWith('config_quest_role_')) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }
        const questNumber = Number(interaction.customId.slice('config_quest_role_'.length));
        const quests = getNormalQuestsConfig(interaction.guild.id);
        if (!quests[questNumber]) {
            return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
        }
        quests[questNumber].roleId = interaction.values[0];
        saveNormalQuestsConfig(interaction.guild.id, quests);
        return await interaction.update({
            embeds: [buildConfigPanelEmbed(`questEditor_${questNumber}`, interaction.guild.id)],
            components: buildConfigPanelComponents(`questEditor_${questNumber}`, interaction.guild.id)
        });
    }

    // --- 2. GESTION DES BOUTONS ---
    if (interaction.isButton()) {
        if (interaction.customId === 'config_quest_channel_clear') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const config = savedConfigs[interaction.guild.id];
            if (config) {
                delete config.questChannelId;
                saveConfigsToFile();
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('quests', interaction.guild.id)],
                components: buildConfigPanelComponents('quests', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_quest_manager_open') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('questManager_0', interaction.guild.id)],
                components: buildConfigPanelComponents('questManager_0', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_quest_manager_back') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const editorMatch = interaction.message.embeds[0]?.title?.match(/quête\s+(\d+)/i);
            const pageNumber = editorMatch ? Math.floor((Number(editorMatch[1]) - 1) / QUEST_MANAGER_PAGE_SIZE) : 0;
            const category = `questManager_${Math.max(0, pageNumber)}`;
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_quest_manager_to_quests') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('quests', interaction.guild.id)],
                components: buildConfigPanelComponents('quests', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_quest_manager_prev' || interaction.customId === 'config_quest_manager_next') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const pageMatch = interaction.message.embeds[0]?.description?.match(/Page\s+(\d+)/);
            const currentPage = Math.max(0, Number(pageMatch?.[1] || 1) - 1);
            const pageNumber = Math.max(0, currentPage + (interaction.customId.endsWith('next') ? 1 : -1));
            const category = `questManager_${pageNumber}`;
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_quest_add' || interaction.customId.startsWith('config_quest_edit_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const isEdit = interaction.customId.startsWith('config_quest_edit_');
            const questNumber = isEdit ? Number(interaction.customId.slice('config_quest_edit_'.length)) : 0;
            const quest = isEdit ? getNormalQuestsConfig(interaction.guild.id)[questNumber] : null;
            if (!isEdit && Object.keys(getNormalQuestsConfig(interaction.guild.id)).length >= MAX_NORMAL_QUESTS) {
                return await interaction.reply({ content: `⚠️ Le parcours est limité à ${MAX_NORMAL_QUESTS} quêtes.`, flags: [MessageFlags.Ephemeral] });
            }
            if (isEdit && !quest) {
                return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
            }
            const modal = new ModalBuilder()
                .setCustomId(isEdit ? `config_quest_edit_modal_${questNumber}` : 'config_quest_create_modal')
                .setTitle(isEdit ? `Modifier la quête ${questNumber}` : 'Ajouter une quête');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('quest_title')
                        .setLabel('Titre')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(100)
                        .setValue(quest?.title || 'Nouvelle quête')
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('quest_type')
                        .setLabel('Type de quête (voir exemples)')
                        .setPlaceholder('messages, voice, invite, manual, reaction, hybrid')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(10)
                        .setValue(quest?.type || 'messages')
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('quest_goal')
                        .setLabel('Objectif (vocal en minutes)')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(8)
                        .setValue(String(quest?.goal || 1))
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('quest_description')
                        .setLabel('Description / détails de l’objectif')
                        .setPlaceholder('Pour hybrid : 100 messages et 1h de vocal.')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(1000)
                        .setValue(quest?.description || 'Décris l’objectif de cette quête.')
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('quest_reward')
                        .setLabel('Récompense affichée (XP auto si Levels actif)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(1000)
                        .setValue(quest?.reward || 'Aucune récompense')
                        .setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('config_quest_delete_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const questNumber = Number(interaction.customId.slice('config_quest_delete_'.length));
            if (!getNormalQuestsConfig(interaction.guild.id)[questNumber]) {
                return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
            }
            if (Object.keys(getNormalQuestsConfig(interaction.guild.id)).length <= 1) {
                return await interaction.reply({ content: '⚠️ Il faut conserver au moins une quête dans le parcours.', flags: [MessageFlags.Ephemeral] });
            }
            const removed = removeNormalQuest(interaction.guild.id, questNumber);
            const pageNumber = Math.floor((questNumber - 1) / QUEST_MANAGER_PAGE_SIZE);
            const category = `questManager_${Math.max(0, pageNumber)}`;
            return await interaction.update({
                content: removed ? '✅ Quête supprimée. Les progressions actives ont été réajustées.' : '❌ La quête n’a pas pu être supprimée.',
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id)
            });
        }

        if (interaction.customId.startsWith('config_quest_role_clear_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const questNumber = Number(interaction.customId.slice('config_quest_role_clear_'.length));
            const quests = getNormalQuestsConfig(interaction.guild.id);
            if (!quests[questNumber]) {
                return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
            }
            quests[questNumber].roleId = '';
            saveNormalQuestsConfig(interaction.guild.id, quests);
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(`questEditor_${questNumber}`, interaction.guild.id)],
                components: buildConfigPanelComponents(`questEditor_${questNumber}`, interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_logs_toggle') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getBotLogSettings(interaction.guild.id);
            saveBotLogSettings(interaction.guild.id, { ...settings, enabled: !settings.enabled });
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('logs', interaction.guild.id)],
                components: buildConfigPanelComponents('logs', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_logs_modules') {
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('logModules', interaction.guild.id)],
                components: buildConfigPanelComponents('logModules', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_logs_back') {
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('logs', interaction.guild.id)],
                components: buildConfigPanelComponents('logs', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_logs_modules_back') {
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('logModules', interaction.guild.id)],
                components: buildConfigPanelComponents('logModules', interaction.guild.id)
            });
        }

        if (interaction.customId.startsWith('config_log_module_toggle_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_toggle_'.length);
            if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
            const settings = getBotLogSettings(interaction.guild.id);
            settings.modules[key].enabled = !settings.modules[key].enabled;
            saveBotLogSettings(interaction.guild.id, settings);
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
                components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id)
            });
        }

        if (interaction.customId.startsWith('config_log_module_color_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_color_'.length);
            if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
            const settings = getBotLogSettings(interaction.guild.id).modules[key];
            const modal = new ModalBuilder()
                .setCustomId(`config_log_module_color_modal_${key}`)
                .setTitle(`Couleur • ${BOT_LOG_MODULES[key].label}`);
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('module_color')
                    .setLabel('Couleur hexadécimale, ex. E17755')
                    .setStyle(TextInputStyle.Short)
                    .setValue(settings.color)
                    .setMaxLength(7)
                    .setRequired(true)
            ));
            return await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('config_log_module_avatar_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_avatar_'.length);
            if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
            const settings = getBotLogSettings(interaction.guild.id).modules[key];
            const modal = new ModalBuilder()
                .setCustomId(`config_log_module_avatar_modal_${key}`)
                .setTitle(`Avatar • ${BOT_LOG_MODULES[key].label}`);
            modal.addComponents(new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('module_avatar')
                    .setLabel('URL HTTP(S), vide pour retirer')
                    .setStyle(TextInputStyle.Short)
                    .setValue(settings.avatarUrl)
                    .setMaxLength(1000)
                    .setRequired(false)
            ));
            return await interaction.showModal(modal);
        }

        if (interaction.customId.startsWith('config_log_module_default_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_default_'.length);
            if (!BOT_LOG_MODULES[key]) return await interaction.reply({ content: '❌ Module de logs inconnu.', flags: [MessageFlags.Ephemeral] });
            const settings = getBotLogSettings(interaction.guild.id);
            settings.modules[key].channelId = '';
            saveBotLogSettings(interaction.guild.id, settings);
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
                components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id)
            });
        }

        if (interaction.customId.startsWith('config_admin_open_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const category = `admin_${interaction.customId.slice('config_admin_open_'.length)}`;
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_token_drop_disable') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const config = savedConfigs[interaction.guild.id];
            if (config) {
                delete config.tokenDropChannelId;
                delete config.nextTokenDropAt;
                saveConfigsToFile();
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('admin_tokens', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_tokens', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_token_economy_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getTokenEconomySettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_token_economy_modal')
                .setTitle('Réglages des jetons');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token_spin_cost')
                        .setLabel('Prix par tour (1–1 000 000 jetons)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.spinCost))
                        .setMaxLength(7)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token_max_spins')
                        .setLabel('Limite de tours achetés (1–10)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.maxPaidSpins))
                        .setMaxLength(2)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token_daily_base')
                        .setLabel('Récompense quotidienne de base (1–100 000)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.dailyBaseReward))
                        .setMaxLength(6)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token_daily_step')
                        .setLabel('Bonus par jour consécutif (0–100 000)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.dailyStreakStep))
                        .setMaxLength(6)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token_daily_cap')
                        .setLabel('Plafond de la récompense quotidienne')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.dailyMaxReward))
                        .setMaxLength(6)
                        .setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_rankup_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getRankupAnnouncementSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_rankup_modal')
                .setTitle('Messages automatiques Rankup');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('rankup_test_message')
                        .setLabel('Message attribué au rôle Test BMF')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Variables : {user}, {role}, {raison}')
                        .setValue(settings.testMessage)
                        .setMaxLength(4000)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('rankup_member_message')
                        .setLabel('Message attribué au rôle Membre BMF')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Variables : {user}, {role}, {raison}')
                        .setValue(settings.memberMessage)
                        .setMaxLength(4000)
                        .setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_admin_deleted_messages') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('logModule_deletedMessages', interaction.guild.id)],
                components: buildConfigPanelComponents('logModule_deletedMessages', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_admin_back') {
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('admin', interaction.guild.id)],
                components: buildConfigPanelComponents('admin', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_admin_toggle_normalquests') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
            savedConfigs[interaction.guild.id].normalQuestsEnabled = !areNormalQuestsEnabled(interaction.guild.id);
            saveConfigsToFile();
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('admin_normalquests', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_normalquests', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_admin_toggle_invites') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
            savedConfigs[interaction.guild.id].inviteLogsEnabled = savedConfigs[interaction.guild.id].inviteLogsEnabled === false;
            saveConfigsToFile();
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('admin_invites', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_invites', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_admin_toggle_specialquests') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const data = loadSpecialQuestsData();
            const state = getSpecialGuildState(data, interaction.guild.id);
            state.enabled = state.enabled === false;
            if (state.enabled && state.nextSpawnAt <= Date.now()) {
                state.nextSpawnAt = Date.now() + getRandomSpecialSpawnDelay();
            }
            saveSpecialQuestsData(data);
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('admin_specialquests', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_specialquests', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_admin_spawn_specialquest') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const data = loadSpecialQuestsData();
            const state = getSpecialGuildState(data, interaction.guild.id);
            state.channelId = state.channelId || (savedConfigs[interaction.guild.id] || {}).specialQuestChannelId;
            if (!state.channelId) {
                return await interaction.reply({ content: '⚠️ Configure d’abord le salon des quêtes spéciales dans Administration.', flags: [MessageFlags.Ephemeral] });
            }
            const spawned = await spawnSpecialQuest(interaction.guild, state, data);
            return await interaction.reply({
                content: spawned ? '✅ Quête spéciale publiée.' : '⚠️ Aucune quête spéciale disponible.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_ticket_create') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            return await openTicketPanelBuilder(interaction, 'ticket');
        }

        if (interaction.customId.startsWith('config_category_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const category = interaction.customId.replace('config_category_', '');
            return await interaction.update({
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_levels_toggle') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const enabled = !getLevelSettings(interaction.guild.id).enabled;
            saveLevelSettings(interaction.guild.id, { enabled });
            refreshLevelVoiceSessions(interaction.guild);
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('levels', interaction.guild.id)],
                components: buildConfigPanelComponents('levels', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_roulette_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getRouletteSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_roulette_modal')
                .setTitle('Réglages de la roulette');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('roulette_spins')
                        .setLabel('Nombre de tours par période (1–100)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.maxSpins))
                        .setMaxLength(3)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('roulette_cooldown_hours')
                        .setLabel('Attente avant reset en heures (1–720)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(String(settings.cooldownHours))
                        .setMaxLength(3)
                        .setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_roulette_toggle') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
            savedConfigs[interaction.guild.id].rouletteEnabled = savedConfigs[interaction.guild.id].rouletteEnabled === false;
            saveConfigsToFile();
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('roulette', interaction.guild.id)],
                components: buildConfigPanelComponents('roulette', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_levels_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getLevelSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_levels_modal')
                .setTitle('Personnaliser les niveaux');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('level_title').setLabel('Titre ({user} et {level} disponibles)').setStyle(TextInputStyle.Short).setValue(settings.title).setMaxLength(100).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('level_image').setLabel('URL de l’image (facultatif)').setStyle(TextInputStyle.Short).setValue(settings.imageUrl).setMaxLength(1000).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('level_color').setLabel('Couleur hexadécimale, ex. D9AA61').setStyle(TextInputStyle.Short).setValue(settings.color).setMaxLength(7).setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_level_xp') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getLevelSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_level_xp_modal')
                .setTitle('Gains d’expérience');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('message_xp').setLabel('XP gagnée par message (1–10000)').setStyle(TextInputStyle.Short).setValue(String(settings.xpPerMessage)).setMaxLength(5).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('message_cooldown').setLabel('Délai message en secondes (1–3600)').setStyle(TextInputStyle.Short).setValue(String(settings.cooldownSeconds)).setMaxLength(4).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('voice_xp').setLabel('XP vocal par intervalle (1–10000)').setStyle(TextInputStyle.Short).setValue(String(settings.voiceXpPerInterval)).setMaxLength(5).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('voice_interval').setLabel('Intervalle vocal en secondes (30–3600)').setStyle(TextInputStyle.Short).setValue(String(settings.voiceIntervalSeconds)).setMaxLength(4).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('voice_min_members').setLabel('Minimum de membres en vocal (1–99)').setStyle(TextInputStyle.Short).setValue(String(settings.minimumVoiceMembers)).setMaxLength(2).setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_level_rewards') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            return await interaction.update({
                embeds: [buildConfigPanelEmbed('levelRewards', interaction.guild.id)],
                components: buildConfigPanelComponents('levelRewards', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_toplevel_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getTopLevelsSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_toplevel_modal')
                .setTitle('Personnaliser Top Levels');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('top_image').setLabel('Image de fond URL HTTP(S), facultatif').setStyle(TextInputStyle.Short).setValue(settings.backgroundImage).setMaxLength(1000).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('top_background').setLabel('Fond hex, ex. 141A24').setStyle(TextInputStyle.Short).setValue(settings.backgroundColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('top_row').setLabel('Fond des lignes hex, ex. 222B3A').setStyle(TextInputStyle.Short).setValue(settings.rowColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('top_border').setLabel('Contours hex, ex. 67D8C0').setStyle(TextInputStyle.Short).setValue(settings.borderColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('top_text').setLabel('Texte hex, ex. F3F5F7').setStyle(TextInputStyle.Short).setValue(settings.textColor).setMaxLength(7).setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'config_questboard_edit') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getQuestLeaderboardSettings(interaction.guild.id);
            const modal = new ModalBuilder()
                .setCustomId('config_questboard_modal')
                .setTitle('Personnaliser le classement');
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('board_image').setLabel('Image de fond URL HTTP(S), facultatif').setStyle(TextInputStyle.Short).setValue(settings.backgroundImage).setMaxLength(1000).setRequired(false)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('board_background').setLabel('Fond hex, ex. 111A19').setStyle(TextInputStyle.Short).setValue(settings.backgroundColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('board_row').setLabel('Fond des lignes hex, ex. 26312E').setStyle(TextInputStyle.Short).setValue(settings.rowColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('board_border').setLabel('Contours hex, ex. D9AA61').setStyle(TextInputStyle.Short).setValue(settings.borderColor).setMaxLength(7).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('board_text').setLabel('Texte hex, ex. F4F0E7').setStyle(TextInputStyle.Short).setValue(settings.textColor).setMaxLength(7).setRequired(true)
                )
            );
            return await interaction.showModal(modal);
        }

        const legendaryProofButton = interaction.customId.match(/^special_legendary_proof_(\d+)$/);
        if (legendaryProofButton) {
            const questNumber = Number(legendaryProofButton[1]);
            const data = loadSpecialQuestsData();
            const guildState = data[interaction.guild.id] && getSpecialGuildState(data, interaction.guild.id);
            const offer = guildState?.offers.find(item =>
                Number(item.questNumber) === questNumber &&
                item.messageId === interaction.message.id &&
                item.status === 'legendary'
            );
            if (!offer || guildState.completedQuestNumbers.includes(questNumber)) {
                return await interaction.reply({ content: '❌ Cette quête légendaire n’est plus ouverte.', flags: [MessageFlags.Ephemeral] });
            }

            const quest = SPECIAL_QUESTS_CONFIG[String(questNumber)];
            const progress = offer.progressByUser?.[interaction.user.id] || {};
            if (questNumber === TEST_LEGENDARY_QUEST_NUMBER && !hasReachedLegendaryActivityGoal(quest, progress)) {
                return await interaction.reply({
                    content: `⏳ Atteins d’abord l’objectif de **${quest.goal} messages**, puis clique à nouveau pour envoyer ta capture d’écran dans le salon de preuves.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const proofChannelId = (savedConfigs[interaction.guild.id] || {}).proofChannelId;
            const proofChannel = proofChannelId
                ? await interaction.guild.channels.fetch(proofChannelId).catch(() => null)
                : null;
            if (!proofChannel?.isTextBased()) {
                return await interaction.reply({ content: '⚠️ Le salon de preuves n’est pas configuré ou est introuvable. Demande à un administrateur de le configurer.', flags: [MessageFlags.Ephemeral] });
            }

            offer.proofRequests ||= {};
            if (offer.proofSubmissions?.[interaction.user.id]) {
                return await interaction.reply({ content: '⏳ Tu as déjà une preuve en attente pour cette quête.', flags: [MessageFlags.Ephemeral] });
            }
            offer.proofRequests[interaction.user.id] = Date.now();
            saveSpecialQuestsData(data);
            return await interaction.reply({
                content: `✅ Envoie dans les prochaines 24 heures ta preuve pour **${SPECIAL_QUESTS_CONFIG[String(questNumber)].title}** (explication et/ou capture d’écran) dans ${proofChannel}. Le staff la vérifiera ; le premier dossier valide remportera la quête.`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        const specialProofReviewButton = interaction.customId.match(/^special_(legendary|flash)_(validate|reject)_(\d+)_(\d+)$/);
        if (specialProofReviewButton) {
            if (!hasQuestValidationPermission(interaction.member)) {
                return await interaction.reply({ content: '❌ Seul le staff autorisé peut valider cette preuve.', flags: [MessageFlags.Ephemeral] });
            }
            const [, proofType, action, questNumberText, targetId] = specialProofReviewButton;
            const questNumber = Number(questNumberText);
            const data = loadSpecialQuestsData();
            const guildState = data[interaction.guild.id] && getSpecialGuildState(data, interaction.guild.id);
            const offer = guildState?.offers.find(item =>
                Number(item.questNumber) === questNumber &&
                (proofType === 'legendary'
                    ? item.status === 'legendary'
                    : item.status === 'claimed' && item.claimedBy === targetId)
            );
            const submission = offer?.proofSubmissions?.[targetId];
            if (!offer || !submission || submission.messageId !== interaction.message.id ||
                guildState.completedQuestNumbers.includes(questNumber)) {
                return await interaction.reply({ content: '❌ Cette preuve ou cette quête spéciale n’est plus en attente.', flags: [MessageFlags.Ephemeral] });
            }

            if (action === 'reject') {
                delete offer.proofSubmissions[targetId];
                saveSpecialQuestsData(data);
                await interaction.message.edit({
                    content: `❌ Preuve refusée par ${interaction.user}. Le membre peut envoyer une nouvelle preuve.`,
                    components: []
                });
                return await interaction.reply({ content: `La preuve de <@${targetId}> a été refusée.`, flags: [MessageFlags.Ephemeral] });
            }

            const earlierSubmission = proofType === 'legendary' && Object.entries(offer.proofSubmissions)
                .some(([memberId, proof]) => memberId !== targetId && Number(proof.submittedAt) < Number(submission.submittedAt));
            if (earlierSubmission) {
                return await interaction.reply({ content: '⏳ Une preuve a été envoyée avant celle-ci. Vérifie les dossiers dans l’ordre d’arrivée pour respecter le premier arrivé, premier servi.', flags: [MessageFlags.Ephemeral] });
            }

            const quest = SPECIAL_QUESTS_CONFIG[String(questNumber)];
            const progress = offer.progressByUser?.[targetId] || {};
            if (proofType === 'legendary' && !hasReachedLegendaryActivityGoal(quest, progress)) {
                return await interaction.reply({ content: '❌ Ce membre n’a pas encore atteint les objectifs suivis par le bot pour cette quête.', flags: [MessageFlags.Ephemeral] });
            }

            const validationKey = `${interaction.guild.id}:${questNumber}`;
            if (proofType === 'legendary' && legendaryQuestValidationLocks.has(validationKey)) {
                return await interaction.reply({ content: '⏳ Une autre validation est déjà en cours pour cette quête.', flags: [MessageFlags.Ephemeral] });
            }
            if (proofType === 'legendary') legendaryQuestValidationLocks.add(validationKey);
            try {
                const member = await interaction.guild.members.fetch(targetId).catch(() => null);
                if (!member) {
                    return await interaction.reply({ content: '❌ Le membre ayant envoyé cette preuve n’est plus sur le serveur.', flags: [MessageFlags.Ephemeral] });
                }
                await completeSpecialQuest(interaction.guild, data, guildState, offer, member);
                await interaction.message.edit({ components: [] });
                return await interaction.reply({
                    content: proofType === 'legendary'
                        ? `✅ La quête légendaire **${quest.title}** est remportée par ${member}.`
                        : `✅ La quête flash **${quest.title}** a été validée pour ${member}.`,
                    flags: [MessageFlags.Ephemeral]
                });
            } finally {
                if (proofType === 'legendary') legendaryQuestValidationLocks.delete(validationKey);
            }
        }

        const specialButton = interaction.customId.match(/^special_(claim|proof|validate)_(\d+)$/);
        if (specialButton) {
            const [, action, questNumberText] = specialButton;
            const questNumber = Number(questNumberText);
            const data = loadSpecialQuestsData();
            const guildState = getSpecialGuildState(data, interaction.guild.id);
            const offer = guildState.offers.find(item =>
                Number(item.questNumber) === questNumber && item.messageId === interaction.message.id
            );

            if (!offer) {
                return await interaction.reply({ content: '❌ Cette offre de quête spéciale n’est plus active.', flags: [MessageFlags.Ephemeral] });
            }

            const quest = SPECIAL_QUESTS_CONFIG[String(questNumber)];
            if (!quest) {
                return await interaction.reply({ content: '❌ Cette quête spéciale est introuvable.', flags: [MessageFlags.Ephemeral] });
            }

            if (action === 'claim') {
                if (offer.status !== 'available') {
                    return await interaction.reply({ content: `❌ Cette quête a déjà été prise par <@${offer.claimedBy}>.`, flags: [MessageFlags.Ephemeral] });
                }
                if (guildState.offers.some(item => item.status === 'claimed' && item.claimedBy === interaction.user.id)) {
                    return await interaction.reply({ content: '❌ Tu as déjà une quête spéciale en cours.', flags: [MessageFlags.Ephemeral] });
                }

                offer.status = 'claimed';
                offer.claimedBy = interaction.user.id;
                offer.claimedByName = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;
                offer.claimedAt = Date.now();
                offer.progress = { progress: 0, messageCount: 0, voiceSeconds: 0, inviteCount: 0 };
                if ((quest.type === 'voice' || quest.type === 'hybrid') && interaction.member?.voice?.channelId) {
                    specialVoiceQuestStart.set(getVoiceQuestKey(interaction.user.id, interaction.guild.id), offer.claimedAt);
                }
                saveSpecialQuestsData(data);

                const embed = buildSpecialQuestEmbed(offer);
                return await interaction.update({ embeds: embed ? [embed] : [], components: buildSpecialQuestButtons(offer) });
            }

            if (offer.status !== 'claimed' || offer.claimedBy !== interaction.user.id && action === 'proof') {
                return await interaction.reply({ content: '❌ Cette quête n’est pas prise par toi.', flags: [MessageFlags.Ephemeral] });
            }

            if (action === 'proof') {
                const proofChannelId = (savedConfigs[interaction.guild.id] || {}).proofChannelId;
                const proofChannel = proofChannelId
                    ? await interaction.guild.channels.fetch(proofChannelId).catch(() => null)
                    : null;
                if (!proofChannel?.isTextBased()) {
                    return await interaction.reply({ content: '⚠️ Le salon de preuves n’est pas configuré. Demande à un administrateur d’utiliser /setproof.', flags: [MessageFlags.Ephemeral] });
                }
                offer.proofRequests ||= {};
                if (offer.proofSubmissions?.[interaction.user.id]) {
                    return await interaction.reply({ content: '⏳ Tu as déjà une preuve en attente pour cette quête.', flags: [MessageFlags.Ephemeral] });
                }
                offer.proofRequests[interaction.user.id] = Date.now();
                saveSpecialQuestsData(data);
                return await interaction.reply({
                    content: `✅ Envoie dans les prochaines 24 heures ta preuve pour **${quest.title}** (explication et/ou capture d’écran) dans ${proofChannel}. Le staff la vérifiera dans un dossier dédié.`,
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (action === 'validate') {
                if (!hasQuestValidationPermission(interaction.member)) {
                    return await interaction.reply({ content: '❌ Seul le staff autorisé peut valider cette quête.', flags: [MessageFlags.Ephemeral] });
                }
                if (!isProofQuest(quest)) {
                    return await interaction.reply({ content: '❌ Cette quête se valide automatiquement par la progression du joueur.', flags: [MessageFlags.Ephemeral] });
                }

                const member = await interaction.guild.members.fetch(offer.claimedBy).catch(() => null);
                await completeSpecialQuest(interaction.guild, data, guildState, offer, member);
                return await interaction.reply({ content: `✅ La quête spéciale **${quest.title}** a été validée pour <@${offer.claimedBy}>.`, flags: [MessageFlags.Ephemeral] });
            }
        }

        if (interaction.customId === 'claim_ticket') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const channel = interaction.channel;
            if (!channel || !channel.isTextBased()) {
                return await interaction.editReply({ content: '❌ Ce salon n’est pas un ticket valide.' });
            }

            const creatorId = activeTickets.get(channel.id);
            const claimMessage = `${interaction.user} a pris en charge ce ticket.`;

            const normalizedCurrentName = channel.name || '';
            const claimedName = normalizedCurrentName.startsWith('🟢') || normalizedCurrentName.startsWith('✅')
                ? normalizedCurrentName
                : `🟢-${normalizedCurrentName}`;

            try {
                await channel.setName(claimedName.slice(0, 100));
            } catch (err) {
                console.error('Impossible de renommer le ticket après prise en charge :', err);
            }

            await channel.send({ content: claimMessage });
            await interaction.editReply({ content: `✅ Tu as pris en charge le ticket ${channel}.` });

            if (creatorId) {
                const creator = await interaction.guild.members.fetch(creatorId).catch(() => null);
                if (creator) {
                    await creator.send(`📌 Ton ticket a été pris en charge par ${interaction.user}. Un membre du staff va maintenant t’aider.`).catch(() => {});
                }
            }
            return;
        }

        if (interaction.customId === 'fermer_ticket') {
            const modal = new ModalBuilder()
                .setCustomId('modal_fermer_ticket')
                .setTitle('Fermeture du ticket');
            const raisonInput = new TextInputBuilder()
                .setCustomId('raison_fermeture')
                .setLabel('Raison de la fermeture')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(raisonInput));
            return await interaction.showModal(modal);
        }

        if (!embedBuilders.has(userId)) {
            embedBuilders.set(userId, {
                mode: 'create',
                name: 'ticket',
                title: 'Titre par défaut',
                description: 'Description par défaut',
                color: '#2B2D31',
                footerText: '',
                footerIcon: '',
                timestamp: false,
                mainImage: '',
                thumbnail: '',
                categoryId: '',
                staffRoleId: '',
                ticketOptions: []
            });
        }
        const data = embedBuilders.get(userId);

        if (interaction.customId === 'publish_embed') {
            const finalEmbed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(data.description)
                .setColor(data.color || 0x2B2D31);

            if (data.footerText) finalEmbed.setFooter({ text: data.footerText, iconURL: data.footerIcon || undefined });
            if (data.timestamp) finalEmbed.setTimestamp();
            if (data.mainImage) finalEmbed.setImage(data.mainImage);
            if (data.thumbnail) finalEmbed.setThumbnail(data.thumbnail);

            const menuId = `menu_ticket_${Date.now()}`;
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(menuId)
                .setPlaceholder('Choisis le motif de ton ticket...')
                .addOptions(data.ticketOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            if (data.mode === 'edit') {
                const channel = await interaction.guild.channels.fetch(data.channelId).catch(() => null);
                if (!channel) return await interaction.editReply({ content: `❌ Salon introuvable.` });

                const message = await channel.messages.fetch(data.messageId).catch(() => null);
                if (!message) return await interaction.editReply({ content: `❌ Message introuvable.` });

                if (data.ticketOptions.length > 0 && data.categoryId && data.staffRoleId) {
                    if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
                    savedConfigs[menuId] = {
                        categoryId: data.categoryId,
                        staffRoleId: data.staffRoleId
                    };
                    saveConfigsToFile();
                    await message.edit({ embeds: [finalEmbed], components: [row] });
                } else {
                    await message.edit({ embeds: [finalEmbed] });
                }

                return await interaction.editReply({ content: `✅ L'embed a été modifié et mis à jour avec succès sur le message !` });
            } else {
                if (!data.categoryId || !data.staffRoleId) {
                    return await interaction.editReply({ content: `⚠️ Tu dois d'abord configurer la catégorie et le rôle staff via le bouton **"⚙️ Configurer le Ticket"** avant d'envoyer !` });
                }

                if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
                savedConfigs[menuId] = {
                    categoryId: data.categoryId,
                    staffRoleId: data.staffRoleId
                };
                saveConfigsToFile();

                await interaction.channel.send({ embeds: [finalEmbed], components: [row] });
                return await interaction.editReply({ content: `✅ Le panneau de tickets a été envoyé et sauvegardé avec succès !` });
            }
        }

        if (interaction.customId === 'edit_basic') {
            const modal = new ModalBuilder().setCustomId('modal_basic').setTitle(`Éditer les infos de base`);
            const titleInput = new TextInputBuilder().setCustomId('title').setLabel('Title').setStyle(TextInputStyle.Short).setValue(data.title || '').setRequired(true);
            const descInput = new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setValue(data.description || '').setRequired(true);
            const colorInput = new TextInputBuilder().setCustomId('color').setLabel('Hex Color (ex: #FF0000)').setStyle(TextInputStyle.Short).setValue(data.color || '#2B2D31').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(titleInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(colorInput));
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'edit_footer') {
            const modal = new ModalBuilder().setCustomId('modal_footer').setTitle(`Éditer le Footer`);
            const footerText = new TextInputBuilder().setCustomId('footer_text').setLabel('Footer Text').setStyle(TextInputStyle.Short).setValue(data.footerText || '').setRequired(false);
            const footerIcon = new TextInputBuilder().setCustomId('footer_icon').setLabel('Footer Image / Icon (URL)').setStyle(TextInputStyle.Short).setValue(data.footerIcon || '').setRequired(false);
            const timestampInput = new TextInputBuilder().setCustomId('timestamp').setLabel('Timestamp? (yes / no)').setStyle(TextInputStyle.Short).setValue(data.timestamp ? 'yes' : 'no').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(footerText), new ActionRowBuilder().addComponents(footerIcon), new ActionRowBuilder().addComponents(timestampInput));
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'edit_images') {
            const modal = new ModalBuilder().setCustomId('modal_images').setTitle(`Éditer les Images`);
            const mainImage = new TextInputBuilder().setCustomId('main_image').setLabel('Main Image (URL)').setStyle(TextInputStyle.Short).setValue(data.mainImage || '').setRequired(false);
            const thumbnail = new TextInputBuilder().setCustomId('thumbnail').setLabel('Thumbnail (URL)').setStyle(TextInputStyle.Short).setValue(data.thumbnail || '').setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(mainImage), new ActionRowBuilder().addComponents(thumbnail));
            return await interaction.showModal(modal);
        }

        if (interaction.customId === 'edit_ticket_setup') {
            const modal = new ModalBuilder().setCustomId('modal_ticket_setup').setTitle(`Configuration des Tickets`);
            const catInput = new TextInputBuilder().setCustomId('category_id').setLabel('ID de la Catégorie (Salon)').setStyle(TextInputStyle.Short).setValue(data.categoryId || '').setRequired(true);
            const roleInput = new TextInputBuilder().setCustomId('role_id').setLabel('ID du Rôle Staff à ping').setStyle(TextInputStyle.Short).setValue(data.staffRoleId || '').setRequired(true);
            const choicesInput = new TextInputBuilder().setCustomId('choices').setLabel('Choix (Nom1, Nom2, Nom3)').setStyle(TextInputStyle.Paragraph).setValue(data.choicesString || 'Support, Recrutement, Partenariat').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(catInput), new ActionRowBuilder().addComponents(roleInput), new ActionRowBuilder().addComponents(choicesInput));
            return await interaction.showModal(modal);
        }
    }

    if (interaction.isButton() && (interaction.customId === 'quest_start' || interaction.customId.startsWith('quest_start_'))) {
        const ownerId = getQuestButtonOwnerId(interaction.customId, 'start');
        if (!ownerId || ownerId !== interaction.user.id) {
            return await interaction.reply({
                content: ownerId
                    ? `❌ Cette quête appartient à <@${ownerId}>. Utilise \`/quest\` pour consulter ta progression.`
                    : '❌ Ce bouton de quête est ancien. Utilise `/quest` pour consulter ta progression.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        try {
            const { data, state } = getQuestState(interaction.user.id, interaction.guild.id);
            const storageKey = getQuestStorageKey(interaction.user.id, interaction.guild.id);
            if (!state.started) {
                return await interaction.editReply('❌ Lance d’abord la commande /quest pour commencer ton parcours.');
            }

            const currentQuest = getNormalQuestsConfig(interaction.guild.id)[1];
            if (!currentQuest) {
                return await interaction.editReply('❌ Aucune quête n’est configurée. Demande à un administrateur d’en ajouter une.');
            }
            data[storageKey] = { ...normalizeQuestState(state), currentQuest: 1, progress: 0, messageCount: 0, voiceSeconds: 0, completed: false, started: true };
            saveQuestsData(data);

            const sent = await sendNormalQuestMessage(interaction.guild, {
                content: `${interaction.user}`,
                embeds: [buildNormalQuestProgressEmbed(interaction.user, data[storageKey], getNormalQuestsConfig(interaction.guild.id))],
                components: [buildQuestOwnerButtons(interaction.user.id, {
                    proof: isProofQuest(currentQuest),
                    validateQuestNumber: 1
                })],
                allowedMentions: { users: [interaction.user.id] }
            });
            return await interaction.editReply(sent
                ? '✅ Ta quête a été publiée dans le salon configuré.'
                : '❌ Impossible de publier ta quête. Vérifie le salon configuré et ses permissions.');
        } catch (err) {
            console.error('Erreur au démarrage d’une quête via le bouton :', err);
            return await interaction.editReply('❌ Une erreur est survenue au démarrage de la quête. Le problème a été enregistré dans les logs du bot.');
        }
    }

    if (interaction.isButton() && (interaction.customId === 'quest_later' || interaction.customId.startsWith('quest_later_'))) {
        const ownerId = getQuestButtonOwnerId(interaction.customId, 'later');
        if (!ownerId || ownerId !== interaction.user.id) {
            return await interaction.reply({
                content: ownerId
                    ? `❌ Cette quête appartient à <@${ownerId}>. Utilise \`/quest\` pour consulter ta progression.`
                    : '❌ Ce bouton de quête est ancien. Utilise `/quest` pour consulter ta progression.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        return await interaction.reply({ content: '⏸️ Pas de souci, tu pourras reprendre plus tard avec `/quest`.', flags: [MessageFlags.Ephemeral] });
    }

    if (interaction.isButton() && (interaction.customId === 'quest_send_proof' || interaction.customId.startsWith('quest_send_proof_'))) {
        const ownerId = getQuestButtonOwnerId(interaction.customId, 'send_proof');
        if (!ownerId || ownerId !== interaction.user.id) {
            return await interaction.reply({
                content: ownerId
                    ? `❌ Cette quête appartient à <@${ownerId}>. Utilise \`/quest\` pour consulter ta progression.`
                    : '❌ Ce bouton de quête est ancien. Utilise `/quest` pour consulter ta progression.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        const { state } = getQuestState(interaction.user.id, interaction.guild.id);
        const quest = getNormalQuestsConfig(interaction.guild.id)[state.currentQuest];

        if (!quest || !isProofQuest(quest)) {
            return await interaction.reply({ content: '❌ Cette quête ne demande pas de preuve.', flags: [MessageFlags.Ephemeral] });
        }

        const guildConfig = savedConfigs[interaction.guild.id] || {};
        const proofChannelId = guildConfig.proofChannelId;
        if (!proofChannelId) {
            return await interaction.reply({ content: '⚠️ Le salon de preuve n’a pas encore été configuré. Demande à un staff de faire /setproof.', flags: [MessageFlags.Ephemeral] });
        }

        const proofChannel = await interaction.guild.channels.fetch(proofChannelId).catch(() => null);
        if (!proofChannel) {
            return await interaction.reply({ content: '⚠️ Le salon de preuve est introuvable. Demande à un staff de le reconfigurer.', flags: [MessageFlags.Ephemeral] });
        }

        const requests = loadQuestProofRequests();
        const requestKey = `${interaction.guild.id}:${interaction.user.id}`;
        const existingRequest = requests[requestKey];
        if (existingRequest?.submissionMessageId) {
            return await interaction.reply({ content: '⏳ Tu as déjà une preuve en attente pour cette quête.', flags: [MessageFlags.Ephemeral] });
        }
        requests[requestKey] = {
            questNumber: state.currentQuest,
            requestedAt: Date.now()
        };
        saveQuestProofRequests(requests);
        return await interaction.reply({
            content: `✅ Envoie dans les prochaines 24 heures ta preuve pour **${quest.title}** (explication et/ou capture d’écran) dans ${proofChannel}. Le staff la vérifiera dans un dossier dédié.`,
            flags: [MessageFlags.Ephemeral]
        });
    }

    if (interaction.isButton() && (interaction.customId === 'quest_validate_current' || interaction.customId.startsWith('quest_validate_current_'))) {
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        if (!hasQuestValidationPermission(interaction.member)) {
            return await interaction.reply({ content: '❌ Tu n’as pas les permissions pour valider cette quête.', flags: [MessageFlags.Ephemeral] });
        }

        const { data, state } = getQuestState(interaction.user.id, interaction.guild.id);
        if (!state.started) {
            return await interaction.reply({ content: '❌ Lance d’abord la commande /quest avant de commencer ton parcours.', flags: [MessageFlags.Ephemeral] });
        }

        const ownerMatch = interaction.customId.match(/^quest_validate_current_(\d+)_(\d+)$/);
        if (interaction.customId.startsWith('quest_validate_current_') &&
            (!ownerMatch || ownerMatch[2] !== interaction.user.id)) {
            return await interaction.reply({
                content: ownerMatch
                    ? `❌ Cette quête appartient à <@${ownerMatch[2]}>. Utilise \`/quest\` pour consulter ta progression.`
                    : '❌ Ce bouton de quête est ancien ou invalide. Utilise `/quest` pour afficher ta progression.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        const buttonQuestNumber = ownerMatch
            ? Number(ownerMatch[1])
            : Number(interaction.customId.slice('quest_validate_current_'.length));
        const legacyTitle = interaction.message.embeds[0]?.title || '';
        const legacyQuestNumber = Number(legacyTitle.match(/Niveau\s+(\d+)/i)?.[1]);
        const questNumber = interaction.customId === 'quest_validate_current' ? legacyQuestNumber : buttonQuestNumber;
        if (!questNumber || questNumber !== state.currentQuest) {
            return await interaction.reply({ content: '❌ Ce bouton concerne une ancienne quête. Relance /quest pour afficher la quête actuelle.', flags: [MessageFlags.Ephemeral] });
        }

        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const currentQuest = guildQuests[questNumber];

        if (!currentQuest) {
            return await interaction.reply({ content: '❌ Quête introuvable.', flags: [MessageFlags.Ephemeral] });
        }

        const nextQuestNumber = questNumber + 1;
        const nextQuest = guildQuests[nextQuestNumber];

        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.messageCount = 0;
        state.voiceSeconds = 0;
        state.inviteCount = 0;
        state.completed = !nextQuest;
        state.started = true;
        data[getQuestStorageKey(interaction.user.id, interaction.guild.id)] = state;
        saveQuestsData(data);

        await grantQuestRoleReward(interaction.guild, interaction.member, currentQuest.reward, currentQuest.roleId);

        const confirmationEmbed = new EmbedBuilder()
            .setTitle('✅ Quête validée par le staff')
            .setDescription(`${interaction.user} a validé la quête **${currentQuest.title}** pour <@${interaction.user.id}>.`)
            .addFields(
                { name: '🏆 Récompense', value: getQuestRewardDisplay(currentQuest), inline: false },
                { name: '➡️ Prochaine étape', value: nextQuest ? `La prochaine quête est : **${nextQuest.title}**` : 'Tu as terminé toutes les quêtes.', inline: false }
            )
            .setColor(0x00FF7F)
            .setTimestamp();

        await interaction.update({ embeds: [confirmationEmbed], components: [] });
        await sendQuestLog(interaction.guild, confirmationEmbed);
        return;
    }

    if (interaction.isButton() &&
        (interaction.customId.startsWith('staff_validate_proof_') || interaction.customId.startsWith('staff_reject_proof_'))) {
        try {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        } catch (err) {
            if (err.code === 10062) {
                console.warn(`Interaction de validation de preuve expirée avant traitement (${interaction.id}).`);
                return;
            }
            throw err;
        }

        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.editReply('⏸️ Les quêtes normales sont désactivées sur ce serveur.');
        }

        if (!hasQuestValidationPermission(interaction.member)) {
            return await interaction.editReply('❌ Tu n’as pas les permissions pour valider cette preuve.');
        }

        const parts = interaction.customId.split('_');
        const targetId = parts[3];
        const questNumber = Number(parts[4] || 0);
        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const currentQuest = guildQuests[questNumber] || guildQuests[Number(questNumber)];
        const proofRequests = loadQuestProofRequests();
        const proofRequestKey = `${interaction.guild.id}:${targetId}`;
        const proofRequest = proofRequests[proofRequestKey];
        const isReject = interaction.customId.startsWith('staff_reject_proof_');

        if (!currentQuest) {
            return await interaction.editReply('❌ Quête introuvable pour cette validation.');
        }
        if (proofRequest?.submissionMessageId && proofRequest.submissionMessageId !== interaction.message.id) {
            return await interaction.editReply('❌ Ce dossier n’est plus la preuve en attente du membre.');
        }
        if (isReject) {
            if (!proofRequest || proofRequest.submissionMessageId !== interaction.message.id) {
                return await interaction.editReply('❌ Cette preuve n’est plus en attente.');
            }
            delete proofRequests[proofRequestKey];
            saveQuestProofRequests(proofRequests);
            await interaction.message.edit({
                content: `❌ Preuve refusée par ${interaction.user}. Le membre peut en envoyer une nouvelle.`,
                components: []
            });
            return await interaction.editReply(`La preuve de <@${targetId}> a été refusée.`);
        }

        const { data, state } = getQuestState(targetId, interaction.guild.id);
        if (!state.started) {
            return await interaction.editReply('❌ Ce membre doit d’abord lancer /quest avant de commencer son parcours.');
        }
        if (state.currentQuest !== questNumber) {
            return await interaction.editReply('❌ Cette preuve concerne une ancienne quête. Le membre est déjà passé à une autre quête.');
        }

        const nextQuestNumber = questNumber + 1;
        const nextQuest = guildQuests[nextQuestNumber];

        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.messageCount = 0;
        state.voiceSeconds = 0;
        state.inviteCount = 0;
        state.completed = !nextQuest;
        state.started = true;
        data[getQuestStorageKey(targetId, interaction.guild.id)] = state;
        saveQuestsData(data);
        if (proofRequest?.submissionMessageId === interaction.message.id) {
            delete proofRequests[proofRequestKey];
            saveQuestProofRequests(proofRequests);
        }

        const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (targetMember) {
            await grantQuestRoleReward(interaction.guild, targetMember, currentQuest.reward, currentQuest.roleId);
        }

        const proofValidationEmbed = new EmbedBuilder()
            .setTitle('✅ Quête validée par le staff')
            .setDescription(`${interaction.user} a validé la quête **${currentQuest.title}** pour <@${targetId}>.`)
            .addFields(
                { name: '🏆 Récompense', value: getQuestRewardDisplay(currentQuest), inline: false },
                { name: '➡️ Prochaine étape', value: nextQuest ? `La prochaine quête est : **${nextQuest.title}**` : 'Tu as terminé toutes les quêtes.', inline: false }
            )
            .setColor(0x00FF7F)
            .setTimestamp();

        await interaction.message.edit({
            content: `${interaction.message.content}\n\n✅ La quête **${currentQuest.title}** a été validée par ${interaction.user.tag}.${nextQuest ? ` Prochaine quête : **${nextQuest.title}**.` : ' Toutes les quêtes sont terminées.'}`,
            components: []
        }).catch(() => {});

        await sendQuestLog(interaction.guild, proofValidationEmbed);

        return await interaction.editReply(`✅ La quête **${currentQuest.title}** a bien été validée pour <@${targetId}>.`);
    }

    if (interaction.isButton() && (interaction.customId === 'quest_continue' || interaction.customId.startsWith('quest_continue_'))) {
        const ownerId = getQuestButtonOwnerId(interaction.customId, 'continue');
        if (!ownerId || ownerId !== interaction.user.id) {
            return await interaction.reply({
                content: ownerId
                    ? `❌ Cette quête appartient à <@${ownerId}>. Utilise \`/quest\` pour consulter ta progression.`
                    : '❌ Ce bouton de quête est ancien. Utilise `/quest` pour consulter ta progression.',
                flags: [MessageFlags.Ephemeral]
            });
        }
        if (!areNormalQuestsEnabled(interaction.guild.id)) {
            return await interaction.reply({ content: '⏸️ Les quêtes normales sont désactivées sur ce serveur.', flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const { data, state } = getQuestState(interaction.user.id, interaction.guild.id);
        if (!state.started) {
            return await interaction.editReply('❌ Lance d’abord la commande /quest pour commencer ton parcours.');
        }

        const guildQuests = getNormalQuestsConfig(interaction.guild.id);
        const storageKey = getQuestStorageKey(interaction.user.id, interaction.guild.id);
        data[storageKey] = { ...state, started: true };
        saveQuestsData(data);

        const sent = await sendNormalQuestMessage(interaction.guild, {
            content: `${interaction.user}`,
            embeds: [buildNormalQuestProgressEmbed(interaction.user, state, guildQuests)],
            components: [buildQuestOwnerButtons(interaction.user.id, {
                proof: guildQuests[state.currentQuest] ? isProofQuest(guildQuests[state.currentQuest]) : false,
                validateQuestNumber: state.currentQuest
            })],
            allowedMentions: { users: [interaction.user.id] }
        });
        return await interaction.editReply(sent
            ? '✅ Ta progression a été publiée dans le salon configuré.'
            : '❌ Impossible de publier ta progression. Vérifie le salon configuré et ses permissions.');
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'config_level_channel') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }

        const channelId = interaction.values[0];
        saveLevelSettings(interaction.guild.id, { channelId });
        return await interaction.update({
            embeds: [buildConfigPanelEmbed('levels', interaction.guild.id)],
            components: buildConfigPanelComponents('levels', interaction.guild.id)
        });
    }

    if (interaction.isRoleSelectMenu() && interaction.customId === 'config_level_reward_role') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
        }

        const roleId = interaction.values[0];
        const reward = getLevelSettings(interaction.guild.id).rewards.find(item => item.roleId === roleId);
        const modal = new ModalBuilder()
            .setCustomId(`config_level_reward_modal_${roleId}`)
            .setTitle('Associer un rôle à un niveau');
        modal.addComponents(new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('reward_level')
                .setLabel('Niveau requis (0 pour supprimer)')
                .setStyle(TextInputStyle.Short)
                .setValue(String(reward?.level || 5))
                .setMaxLength(4)
                .setRequired(true)
        ));
        return await interaction.showModal(modal);
    }

    // --- 3. SOUMISSION DES MODALS ---
    if (interaction.isModalSubmit()) {
        const questEditMatch = interaction.customId.match(/^config_quest_edit_modal_(\d+)$/);
        if (interaction.customId === 'config_quest_create_modal' || questEditMatch) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const title = interaction.fields.getTextInputValue('quest_title').trim();
            const type = interaction.fields.getTextInputValue('quest_type').trim().toLowerCase();
            const goal = Number(interaction.fields.getTextInputValue('quest_goal').trim());
            const description = interaction.fields.getTextInputValue('quest_description').trim();
            const reward = interaction.fields.getTextInputValue('quest_reward').trim();
            const xpRewardMatch = reward.match(/(?:^|[^\d])([\d][\d\s.,]*)\s*XP\b/i);
            const invalidXpReward = xpRewardMatch && (() => {
                const amount = Number(xpRewardMatch[1].replace(/\D/g, ''));
                return !Number.isSafeInteger(amount) || amount > 1000000000;
            })();
            if (!title || !QUEST_TYPES.has(type) || !Number.isInteger(goal) || goal < 1 || goal > 10000000 || !description || !reward || invalidXpReward) {
                return await interaction.reply({
                    content: '❌ Vérifie les champs : type parmi messages, voice, invite, manual, reaction, hybrid ; objectif entier entre 1 et 10 000 000 ; récompense XP au plus égale à 1 000 000 000.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            const quests = getNormalQuestsConfig(interaction.guild.id);
            let questNumber;
            if (questEditMatch) {
                questNumber = Number(questEditMatch[1]);
                if (!quests[questNumber]) {
                    return await interaction.reply({ content: '❌ Cette quête n’existe plus.', flags: [MessageFlags.Ephemeral] });
                }
                quests[questNumber] = { ...quests[questNumber], title, type, goal, description, reward };
            } else {
                questNumber = Object.keys(quests).length + 1;
                quests[questNumber] = { title, type, goal, description, reward, roleId: '' };
            }
            saveNormalQuestsConfig(interaction.guild.id, quests);
            const category = `questEditor_${questNumber}`;
            return await interaction.reply({
                content: '✅ La quête a été enregistrée. Tu peux maintenant lui associer un rôle dans le sélecteur ci-dessous.',
                embeds: [buildConfigPanelEmbed(category, interaction.guild.id)],
                components: buildConfigPanelComponents(category, interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        const legendaryProofSubmit = interaction.customId.match(/^special_legendary_proof_submit_(\d+)$/);
        if (legendaryProofSubmit) {
            const questNumber = Number(legendaryProofSubmit[1]);
            const data = loadSpecialQuestsData();
            const guildState = data[interaction.guild.id] && getSpecialGuildState(data, interaction.guild.id);
            const offer = guildState?.offers.find(item =>
                Number(item.questNumber) === questNumber && item.status === 'legendary'
            );
            if (!offer || guildState.completedQuestNumbers.includes(questNumber)) {
                return await interaction.reply({ content: '❌ Cette quête légendaire n’est plus ouverte.', flags: [MessageFlags.Ephemeral] });
            }

            const quest = SPECIAL_QUESTS_CONFIG[String(questNumber)];
            const progress = offer.progressByUser?.[interaction.user.id] || {};
            if (!hasReachedLegendaryActivityGoal(quest, progress)) {
                return await interaction.reply({ content: '❌ Tu n’as pas encore atteint les objectifs de messages/vocal suivis par le bot pour cette quête.', flags: [MessageFlags.Ephemeral] });
            }

            const submissionKey = `${interaction.guild.id}:${questNumber}:${interaction.user.id}`;
            offer.proofSubmissions ||= {};
            if (offer.proofSubmissions[interaction.user.id] || legendaryProofSubmissionLocks.has(submissionKey)) {
                return await interaction.reply({ content: '⏳ Tu as déjà une preuve en attente de vérification pour cette quête.', flags: [MessageFlags.Ephemeral] });
            }
            legendaryProofSubmissionLocks.add(submissionKey);
            try {
                const proofChannelId = (savedConfigs[interaction.guild.id] || {}).proofChannelId;
                const proofChannel = proofChannelId
                    ? await interaction.guild.channels.fetch(proofChannelId).catch(() => null)
                    : null;
                if (!proofChannel?.isTextBased()) {
                    return await interaction.reply({ content: '⚠️ Le salon de preuves n’est pas configuré ou est introuvable.', flags: [MessageFlags.Ephemeral] });
                }

                const proofText = interaction.fields.getTextInputValue('legendary_proof_text').trim();
                const proofImageUrl = interaction.fields.getTextInputValue('legendary_proof_image').trim();
                const isValidImageUrl = !proofImageUrl || (() => {
                    try {
                        return ['http:', 'https:'].includes(new URL(proofImageUrl).protocol);
                    } catch {
                        return false;
                    }
                })();
                if (!proofText || !isValidImageUrl) {
                    return await interaction.reply({ content: '❌ Ajoute une description de preuve et un lien d’image HTTP(S) valide, ou laisse le lien vide.', flags: [MessageFlags.Ephemeral] });
                }

                const proofEmbed = new EmbedBuilder()
                    .setTitle(`🏆 Preuve légendaire • ${quest.title}`)
                    .setDescription(proofText)
                    .addFields({ name: 'Membre', value: `${interaction.user}`, inline: true })
                    .setColor(0x8E44AD)
                    .setTimestamp();
                if (proofImageUrl) proofEmbed.setImage(proofImageUrl);
                const validationButton = new ButtonBuilder()
                    .setCustomId(`special_legendary_validate_${questNumber}_${interaction.user.id}`)
                    .setLabel('Valider cette preuve')
                    .setStyle(ButtonStyle.Success);
                const rejectButton = new ButtonBuilder()
                    .setCustomId(`special_legendary_reject_${questNumber}_${interaction.user.id}`)
                    .setLabel('Refuser cette preuve')
                    .setStyle(ButtonStyle.Danger);
                const proofMessage = await proofChannel.send({
                    embeds: [proofEmbed],
                    components: [new ActionRowBuilder().addComponents(validationButton, rejectButton)],
                    allowedMentions: { parse: [], users: [interaction.user.id] }
                });
                offer.proofSubmissions[interaction.user.id] = {
                    messageId: proofMessage.id,
                    submittedAt: Date.now()
                };
                saveSpecialQuestsData(data);
                return await interaction.reply({ content: `✅ Ta preuve est envoyée dans ${proofChannel}. Le staff la vérifiera ; le premier dossier valide l’emportera.`, flags: [MessageFlags.Ephemeral] });
            } finally {
                legendaryProofSubmissionLocks.delete(submissionKey);
            }
        }

        if (interaction.customId === 'config_rankup_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const testMessage = interaction.fields.getTextInputValue('rankup_test_message').trim();
            const memberMessage = interaction.fields.getTextInputValue('rankup_member_message').trim();
            if (!testMessage || !memberMessage) {
                return await interaction.reply({ content: '❌ Les deux messages doivent contenir du texte.', flags: [MessageFlags.Ephemeral] });
            }
            saveRankupAnnouncementSettings(interaction.guild.id, { testMessage, memberMessage });
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('admin_rankup', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_rankup', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId.startsWith('config_log_module_color_modal_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_color_modal_'.length);
            const color = interaction.fields.getTextInputValue('module_color').trim().replace(/^#/, '');
            if (!BOT_LOG_MODULES[key] || !/^[0-9a-fA-F]{6}$/.test(color)) {
                return await interaction.reply({ content: '❌ Entre une couleur hexadécimale à 6 caractères.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getBotLogSettings(interaction.guild.id);
            settings.modules[key].color = color.toUpperCase();
            saveBotLogSettings(interaction.guild.id, settings);
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
                components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId.startsWith('config_log_module_avatar_modal_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }
            const key = interaction.customId.slice('config_log_module_avatar_modal_'.length);
            const avatarUrl = interaction.fields.getTextInputValue('module_avatar').trim();
            const isValidUrl = !avatarUrl || (() => {
                try {
                    return ['http:', 'https:'].includes(new URL(avatarUrl).protocol);
                } catch {
                    return false;
                }
            })();
            if (!BOT_LOG_MODULES[key] || !isValidUrl) {
                return await interaction.reply({ content: '❌ Entre une URL d’image HTTP(S) valide ou laisse le champ vide pour retirer l’avatar.', flags: [MessageFlags.Ephemeral] });
            }
            const settings = getBotLogSettings(interaction.guild.id);
            settings.modules[key].avatarUrl = avatarUrl;
            saveBotLogSettings(interaction.guild.id, settings);
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed(`logModule_${key}`, interaction.guild.id)],
                components: buildConfigPanelComponents(`logModule_${key}`, interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_token_economy_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const settings = {
                spinCost: Number(interaction.fields.getTextInputValue('token_spin_cost')),
                maxPaidSpins: Number(interaction.fields.getTextInputValue('token_max_spins')),
                dailyBaseReward: Number(interaction.fields.getTextInputValue('token_daily_base')),
                dailyStreakStep: Number(interaction.fields.getTextInputValue('token_daily_step')),
                dailyMaxReward: Number(interaction.fields.getTextInputValue('token_daily_cap'))
            };
            if (!Number.isInteger(settings.spinCost) || settings.spinCost < 1 || settings.spinCost > 1000000 ||
                !Number.isInteger(settings.maxPaidSpins) || settings.maxPaidSpins < 1 || settings.maxPaidSpins > 10 ||
                !Number.isInteger(settings.dailyBaseReward) || settings.dailyBaseReward < 1 || settings.dailyBaseReward > 100000 ||
                !Number.isInteger(settings.dailyStreakStep) || settings.dailyStreakStep < 0 || settings.dailyStreakStep > 100000 ||
                !Number.isInteger(settings.dailyMaxReward) || settings.dailyMaxReward < settings.dailyBaseReward || settings.dailyMaxReward > 100000) {
                return await interaction.reply({
                    content: '❌ Vérifie les limites : prix 1–1 000 000, limite 1–10 tours, récompense de base 1–100 000, bonus 0–100 000 et plafond supérieur ou égal à la récompense de base.',
                    flags: [MessageFlags.Ephemeral]
                });
            }

            if (!savedConfigs[interaction.guild.id]) savedConfigs[interaction.guild.id] = {};
            savedConfigs[interaction.guild.id].tokenEconomy = settings;
            saveConfigsToFile();
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('admin_tokens', interaction.guild.id)],
                components: buildConfigPanelComponents('admin_tokens', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_roulette_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const maxSpins = Number(interaction.fields.getTextInputValue('roulette_spins'));
            const cooldownHours = Number(interaction.fields.getTextInputValue('roulette_cooldown_hours'));
            if (!Number.isInteger(maxSpins) || maxSpins < 1 || maxSpins > 100 ||
                !Number.isInteger(cooldownHours) || cooldownHours < 1 || cooldownHours > 720) {
                return await interaction.reply({ content: '❌ Indique entre 1 et 100 tours et un délai entre 1 et 720 heures.', flags: [MessageFlags.Ephemeral] });
            }

            saveRouletteSettings(interaction.guild.id, { maxSpins, cooldownHours });
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('roulette', interaction.guild.id)],
                components: buildConfigPanelComponents('roulette', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_level_xp_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const xpPerMessage = Number(interaction.fields.getTextInputValue('message_xp'));
            const cooldownSeconds = Number(interaction.fields.getTextInputValue('message_cooldown'));
            const voiceXpPerInterval = Number(interaction.fields.getTextInputValue('voice_xp'));
            const voiceIntervalSeconds = Number(interaction.fields.getTextInputValue('voice_interval'));
            const minimumVoiceMembers = Number(interaction.fields.getTextInputValue('voice_min_members'));
            if (!Number.isInteger(xpPerMessage) || xpPerMessage < 1 || xpPerMessage > 10000 ||
                !Number.isInteger(cooldownSeconds) || cooldownSeconds < 1 || cooldownSeconds > 3600 ||
                !Number.isInteger(voiceXpPerInterval) || voiceXpPerInterval < 1 || voiceXpPerInterval > 10000 ||
                !Number.isInteger(voiceIntervalSeconds) || voiceIntervalSeconds < 30 || voiceIntervalSeconds > 3600 ||
                !Number.isInteger(minimumVoiceMembers) || minimumVoiceMembers < 1 || minimumVoiceMembers > 99) {
                return await interaction.reply({ content: '❌ Vérifie les limites indiquées pour l’XP, les intervalles et le nombre de membres en vocal.', flags: [MessageFlags.Ephemeral] });
            }

            saveLevelSettings(interaction.guild.id, {
                xpPerMessage,
                cooldownSeconds,
                voiceXpPerInterval,
                voiceIntervalSeconds,
                minimumVoiceMembers
            });
            refreshLevelVoiceSessions(interaction.guild);
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('levels', interaction.guild.id)],
                components: buildConfigPanelComponents('levels', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId.startsWith('config_level_reward_modal_')) {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const roleId = interaction.customId.slice('config_level_reward_modal_'.length);
            const level = Number(interaction.fields.getTextInputValue('reward_level'));
            if (!Number.isInteger(level) || level < 0 || level > 1000) {
                return await interaction.reply({ content: '❌ Le niveau doit être un nombre entier entre 0 et 1000.', flags: [MessageFlags.Ephemeral] });
            }

            const rewards = getLevelSettings(interaction.guild.id).rewards.filter(reward => reward.roleId !== roleId);
            if (level > 0) rewards.push({ level, roleId });
            saveLevelSettings(interaction.guild.id, { rewards });
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('levelRewards', interaction.guild.id)],
                components: buildConfigPanelComponents('levelRewards', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_toplevel_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const backgroundImage = interaction.fields.getTextInputValue('top_image').trim();
            const backgroundColor = interaction.fields.getTextInputValue('top_background').trim().replace(/^#/, '');
            const rowColor = interaction.fields.getTextInputValue('top_row').trim().replace(/^#/, '');
            const borderColor = interaction.fields.getTextInputValue('top_border').trim().replace(/^#/, '');
            const textColor = interaction.fields.getTextInputValue('top_text').trim().replace(/^#/, '');
            const isValidImageUrl = !backgroundImage || (() => {
                try {
                    return ['http:', 'https:'].includes(new URL(backgroundImage).protocol);
                } catch {
                    return false;
                }
            })();
            const colors = [backgroundColor, rowColor, borderColor, textColor];

            if (!isValidImageUrl || colors.some(color => !/^[0-9a-fA-F]{6}$/.test(color))) {
                return await interaction.reply({ content: '❌ L’image doit être une URL HTTP(S) et chaque couleur doit être un code hex à 6 caractères.', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            if (backgroundImage && !(await loadCanvasImage(backgroundImage))) {
                return await interaction.editReply({ content: '❌ Cette URL ne renvoie pas une image accessible. Envoie l’image sur Discord puis colle le lien direct du fichier.' });
            }

            saveTopLevelsSettings(interaction.guild.id, {
                backgroundImage,
                backgroundColor: backgroundColor.toUpperCase(),
                rowColor: rowColor.toUpperCase(),
                borderColor: borderColor.toUpperCase(),
                textColor: textColor.toUpperCase()
            });
            return await interaction.editReply({
                embeds: [buildConfigPanelEmbed('levels', interaction.guild.id)],
                components: buildConfigPanelComponents('levels', interaction.guild.id)
            });
        }

        if (interaction.customId === 'config_questboard_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const backgroundImage = interaction.fields.getTextInputValue('board_image').trim();
            const backgroundColor = interaction.fields.getTextInputValue('board_background').trim().replace(/^#/, '');
            const rowColor = interaction.fields.getTextInputValue('board_row').trim().replace(/^#/, '');
            const borderColor = interaction.fields.getTextInputValue('board_border').trim().replace(/^#/, '');
            const textColor = interaction.fields.getTextInputValue('board_text').trim().replace(/^#/, '');
            const isValidImageUrl = !backgroundImage || (() => {
                try {
                    return ['http:', 'https:'].includes(new URL(backgroundImage).protocol);
                } catch {
                    return false;
                }
            })();
            const colors = [backgroundColor, rowColor, borderColor, textColor];

            if (!isValidImageUrl || colors.some(color => !/^[0-9a-fA-F]{6}$/.test(color))) {
                return await interaction.reply({ content: '❌ L’image doit être une URL HTTP(S) et chaque couleur doit être un code hex à 6 caractères.', flags: [MessageFlags.Ephemeral] });
            }

            saveQuestLeaderboardSettings(interaction.guild.id, {
                backgroundImage,
                backgroundColor: backgroundColor.toUpperCase(),
                rowColor: rowColor.toUpperCase(),
                borderColor: borderColor.toUpperCase(),
                textColor: textColor.toUpperCase()
            });
            return await interaction.reply({
                embeds: [buildConfigPanelEmbed('quests', interaction.guild.id)],
                components: buildConfigPanelComponents('quests', interaction.guild.id),
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.customId === 'config_levels_modal') {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❌ Réservé aux administrateurs.', flags: [MessageFlags.Ephemeral] });
            }

            const title = interaction.fields.getTextInputValue('level_title').trim();
            const imageUrl = interaction.fields.getTextInputValue('level_image').trim();
            const color = interaction.fields.getTextInputValue('level_color').trim().replace(/^#/, '');
            const isValidImageUrl = !imageUrl || (() => {
                try {
                    return ['http:', 'https:'].includes(new URL(imageUrl).protocol);
                } catch {
                    return false;
                }
            })();

            if (!title || !/^[0-9a-fA-F]{6}$/.test(color) || !isValidImageUrl) {
                return await interaction.reply({ content: '❌ Vérifie le titre, l’URL HTTP(S) et la couleur hexadécimale.', flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            if (imageUrl && !(await loadCanvasImage(imageUrl))) {
                return await interaction.editReply({ content: '❌ Cette URL ne renvoie pas une image accessible. Envoie l’image sur Discord puis colle le lien direct du fichier.' });
            }

            saveLevelSettings(interaction.guild.id, { title, imageUrl, color: color.toUpperCase() });
            return await interaction.editReply({ content: '✅ L’annonce et l’image des niveaux ont été mises à jour.' });
        }

        if (interaction.customId.startsWith('proof_submit_')) {
            const questNumber = Number(interaction.customId.replace('proof_submit_', ''));
            const currentQuest = getNormalQuestsConfig(interaction.guild.id)[questNumber];
            const proofText = interaction.fields.getTextInputValue('proof_text');
            const proofImageUrl = interaction.fields.getTextInputValue('proof_image_url').trim();

            if (!currentQuest) {
                return await interaction.reply({ content: '❌ Quête introuvable pour l’envoi de preuve.', flags: [MessageFlags.Ephemeral] });
            }

            const guildConfig = savedConfigs[interaction.guild.id] || {};
            const proofChannelId = guildConfig.proofChannelId;
            if (!proofChannelId) {
                return await interaction.reply({ content: '⚠️ Le salon de preuve n’a pas été configuré.', flags: [MessageFlags.Ephemeral] });
            }

            const proofChannel = await interaction.guild.channels.fetch(proofChannelId).catch(() => null);
            if (!proofChannel) {
                return await interaction.reply({ content: '⚠️ Le salon de preuve est introuvable.', flags: [MessageFlags.Ephemeral] });
            }

            const validateButton = new ButtonBuilder()
                .setCustomId(`staff_validate_proof_${interaction.user.id}_${questNumber}`)
                .setLabel('Valider cette preuve')
                .setStyle(ButtonStyle.Success);
            const rejectButton = new ButtonBuilder()
                .setCustomId(`staff_reject_proof_${interaction.user.id}_${questNumber}`)
                .setLabel('Refuser cette preuve')
                .setStyle(ButtonStyle.Danger);
            const proofEmbed = new EmbedBuilder()
                .setTitle(`📋 Preuve de quête • ${currentQuest.title}`)
                .setDescription(proofText.trim())
                .addFields({ name: 'Membre', value: `${interaction.user}`, inline: true })
                .setColor(0x3B82F6)
                .setTimestamp();
            if (proofImageUrl) {
                try {
                    if (!['http:', 'https:'].includes(new URL(proofImageUrl).protocol)) {
                        return await interaction.reply({ content: '❌ Le lien de la capture doit être une URL HTTP(S).', flags: [MessageFlags.Ephemeral] });
                    }
                    proofEmbed.setImage(proofImageUrl);
                } catch {
                    return await interaction.reply({ content: '❌ Le lien de la capture n’est pas valide.', flags: [MessageFlags.Ephemeral] });
                }
            }

            const proofMessage = await proofChannel.send({
                embeds: [proofEmbed],
                components: [new ActionRowBuilder().addComponents(validateButton, rejectButton)],
                allowedMentions: { parse: [], users: [interaction.user.id] }
            });

            pendingProofs.set(`${interaction.user.id}:${questNumber}`, { questNumber, proofText, proofImageUrl, sentAt: Date.now() });
            const proofRequests = loadQuestProofRequests();
            proofRequests[`${interaction.guild.id}:${interaction.user.id}`] = {
                questNumber,
                requestedAt: Date.now(),
                submittedAt: Date.now(),
                submissionMessageId: proofMessage.id
            };
            saveQuestProofRequests(proofRequests);
            return await interaction.reply({ content: `✅ Ta preuve a bien été envoyée dans ${proofChannel}. Un staff la validera.`, flags: [MessageFlags.Ephemeral] });
        }

        if (!embedBuilders.has(userId)) {
            embedBuilders.set(userId, { mode: 'create', name: 'ticket', title: '', description: '', color: '#2B2D31', footerText: '', footerIcon: '', timestamp: false, mainImage: '', thumbnail: '', categoryId: '', staffRoleId: '', ticketOptions: [] });
        }
        let data = embedBuilders.get(userId);

        if (interaction.customId === 'modal_basic') {
            data.title = interaction.fields.getTextInputValue('title');
            data.description = interaction.fields.getTextInputValue('description');
            data.color = interaction.fields.getTextInputValue('color');
            return await interaction.reply({ content: '✅ Infos de base enregistrées !', flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId === 'modal_footer') {
            data.footerText = interaction.fields.getTextInputValue('footer_text');
            data.footerIcon = interaction.fields.getTextInputValue('footer_icon');
            const ts = interaction.fields.getTextInputValue('timestamp').toLowerCase();
            data.timestamp = (ts === 'yes' || ts === 'oui' || ts === 'true');
            return await interaction.reply({ content: '✅ Footer enregistré !', flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId === 'modal_images') {
            data.mainImage = interaction.fields.getTextInputValue('main_image');
            data.thumbnail = interaction.fields.getTextInputValue('thumbnail');
            return await interaction.reply({ content: '✅ Images enregistrées !', flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId === 'modal_ticket_setup') {
            // On s'assure de bien stocker l'ID de la catégorie
            data.categoryId = interaction.fields.getTextInputValue('category_id');
            data.staffRoleId = interaction.fields.getTextInputValue('role_id');
            const rawChoices = interaction.fields.getTextInputValue('choices');
            data.choicesString = rawChoices;

            const choicesArray = rawChoices.split(',').map(c => c.trim()).filter(c => c.length > 0);
            
            data.ticketOptions = choicesArray.map((choice, index) => {
                const valueKey = choice.toLowerCase().replace(/[^a-z0-9]/g, '_');
                return {
                    label: choice,
                    description: `Ouvrir un ticket pour : ${choice}`,
                    value: `${valueKey}_${index}`,
                    emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index] || '🎫'
                };
            });

            return await interaction.reply({ content: `✅ Paramètres de tickets enregistrés avec succès (${data.ticketOptions.length} choix configurés) ! Assure-toi bien d'avoir mis l'ID d'une **catégorie** et non d'un salon.`, flags: [MessageFlags.Ephemeral] });
        }

        if (interaction.customId === 'modal_fermer_ticket') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const raison = interaction.fields.getTextInputValue('raison_fermeture');
            const channel = interaction.channel;
            const staffUser = interaction.user;

            const creatorId = activeTickets.get(channel.id);

            if (creatorId) {
                try {
                    const creatorUser = await client.users.fetch(creatorId);
                    await creatorUser.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🔒 Ticket Fermé')
                                .setColor(0xFF0000)
                                .setDescription(`Ton ticket sur le serveur **${interaction.guild.name}** a été fermé.`)
                                .addFields(
                                    { name: 'Fermé par', value: `${staffUser.tag}`, inline: true },
                                    { name: 'Raison', value: raison, inline: false }
                                )
                                .setTimestamp()
                        ]
                    });
                } catch (err) {
                    console.error("Impossible d'envoyer le MP au créateur du ticket :", err);
                }
            }

            const logEmbed = new EmbedBuilder()
                .setTitle('🔒 Ticket Fermé')
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Salon', value: `${channel.name}`, inline: true },
                    { name: 'Fermé par', value: `${staffUser.tag}`, inline: true },
                    { name: 'Raison', value: raison, inline: false }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);

            await interaction.editReply({ content: `🔒 Ticket fermé avec succès. Suppression dans 5 secondes...` });

            setTimeout(() => {
                channel.delete().catch(err => console.error("Erreur suppression ticket:", err));
                activeTickets.delete(channel.id);
            }, 5000);
        }

        if (interaction.customId === 'modal_rankup') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const userInput = interaction.fields.getTextInputValue('target_user').replace(/<@!?&?(\d+)>/g, '$1').trim();
            const roleInput = interaction.fields.getTextInputValue('target_role').replace(/<@!?&?(\d+)>/g, '$1').trim();
            const raison = interaction.fields.getTextInputValue('reason');

            const targetMember = await interaction.guild.members.fetch(userInput).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `❌ Membre introuvable. Vérifie l'ID ou la mention.` });

            const role = interaction.guild.roles.cache.find(r => r.id === roleInput || r.name.toLowerCase() === roleInput.toLowerCase());
            if (!role) return interaction.editReply({ content: `❌ Rôle introuvable. Vérifie le nom ou l'ID du rôle.` });

            try {
                await targetMember.roles.add(role);
            } catch (err) {
                return interaction.editReply({ content: `❌ Impossible d'ajouter ce rôle (vérifie la hiérarchie des rôles du bot).` });
            }

            await sendMP(targetMember.user, `🎉 **Félicitations !**\nVous avez été promu au rang de **${role.name}** sur le serveur **${interaction.guild.name}**.\n**Raison :** ${raison}`);
            await interaction.channel.send(`📈 **${targetMember}** a été promu au rang de **${role.name}** !\n*Raison :* ${raison} (Action par ${interaction.user})`);

            const logEmbed = new EmbedBuilder()
                .setTitle('📈 Promotion (Rankup)')
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Membre', value: `${targetMember.user.tag}`, inline: true },
                    { name: 'Rôle attribué', value: `${role.name}`, inline: true },
                    { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                    { name: 'Raison', value: raison, inline: false }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);

            return interaction.editReply({ content: `✅ Rankup effectué avec succès pour ${targetMember.user.tag} !` });
        }

        if (interaction.customId === 'modal_derank') {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const userInput = interaction.fields.getTextInputValue('target_user').replace(/<@!?&?(\d+)>/g, '$1').trim();
            const roleRemoveInput = interaction.fields.getTextInputValue('role_remove').replace(/<@!?&?(\d+)>/g, '$1').trim();
            const roleAddInput = interaction.fields.getTextInputValue('role_add').replace(/<@!?&?(\d+)>/g, '$1').trim();
            const raison = interaction.fields.getTextInputValue('reason');

            const targetMember = await interaction.guild.members.fetch(userInput).catch(() => null);
            if (!targetMember) return interaction.editReply({ content: `❌ Membre introuvable. Vérifie l'ID ou la mention.` });

            const roleRemove = interaction.guild.roles.cache.find(r => r.id === roleRemoveInput || r.name.toLowerCase() === roleRemoveInput.toLowerCase());
            if (!roleRemove) return interaction.editReply({ content: `❌ Rôle à retirer introuvable.` });

            let roleAdd = null;
            if (roleAddInput.length > 0) {
                roleAdd = interaction.guild.roles.cache.find(r => r.id === roleAddInput || r.name.toLowerCase() === roleAddInput.toLowerCase());
                if (!roleAdd) return interaction.editReply({ content: `❌ Le nouveau rôle à ajouter est introuvable.` });
            }

            try {
                await targetMember.roles.remove(roleRemove);
                if (roleAdd) {
                    await targetMember.roles.add(roleAdd);
                }
            } catch (err) {
                return interaction.editReply({ content: `❌ Erreur lors de la modification des rôles (vérifie la hiérarchie).` });
            }

            let mpMessage = "";
            let publicMessage = "";

            if (roleAdd) {
                mpMessage = `📉 **Mise à jour de votre grade**\nVous avez été derank sur le serveur **${interaction.guild.name}**. Vous passez du rôle **${roleRemove.name}** au rôle **${roleAdd.name}**.\n**Raison :** ${raison}`;
                publicMessage = `📉 **${targetMember}** a été derank. Il passe du rôle **${roleRemove.name}** à **${roleAdd.name}**.\n*Raison :* ${raison} (Action par ${interaction.user})`;
            } else {
                mpMessage = `📉 **Mise à jour de votre grade**\nVous avez été derank du rôle **${roleRemove.name}** sur le serveur **${interaction.guild.name}**.\nSi vous pensez que nous avons fait une erreur, faites un ticket.\n**Raison :** ${raison}`;
                publicMessage = `📉 **${targetMember}** a été retiré du rôle **${roleRemove.name}**.\n*Raison :* ${raison} (Action par ${interaction.user})`;
            }

            await sendMP(targetMember.user, mpMessage);
            await interaction.channel.send(publicMessage);

            const logEmbed = new EmbedBuilder()
                .setTitle('📉 Rétrogradation (Derank)')
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Membre', value: `${targetMember.user.tag}`, inline: true },
                    { name: 'Rôle retiré', value: `${roleRemove.name}`, inline: true },
                    { name: 'Rôle ajouté', value: roleAdd ? roleAdd.name : 'Aucun', inline: true },
                    { name: 'Modérateur', value: `${interaction.user.tag}`, inline: false },
                    { name: 'Raison', value: raison, inline: false }
                )
                .setTimestamp();
            await sendLog(interaction.guild, logEmbed);

            return interaction.editReply({ content: `✅ Derank effectué avec succès pour ${targetMember.user.tag} !` });
        }
    }

    // --- 4. OUVERTURE D'UN TICKET (SELECT MENU) ---
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('menu_ticket_')) {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const configKey = interaction.customId;
        const ticketConfig = savedConfigs[configKey];

        if (!ticketConfig) {
            return interaction.editReply({ content: `❌ Erreur : Configuration introuvable dans le fichier de sauvegarde.` });
        }

        const choixValue = interaction.values[0];
        const selectedOption = interaction.component.options.find(o => o.value === choixValue);
        const labelChoisi = selectedOption ? selectedOption.label : 'Support';
        const nomSalon = labelChoisi.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-');

        const staffRoleOverwrite = ticketConfig.staffRoleId
            ? { id: ticketConfig.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            : null;

        const ticketChannel = await interaction.guild.channels.create({
            name: `${nomSalon}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: ticketConfig.categoryId,
            permissionOverwrites: [
                { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                ...(staffRoleOverwrite ? [staffRoleOverwrite] : [])
            ],
        });
        activeTickets.set(ticketChannel.id, interaction.user.id);

        const boutonClaim = new ButtonBuilder()
            .setCustomId('claim_ticket')
            .setLabel('Prendre en charge')
            .setEmoji('🙋‍♂️')
            .setStyle(ButtonStyle.Primary);

        const boutonFermer = new ButtonBuilder()
            .setCustomId('fermer_ticket')
            .setLabel('Fermer le ticket')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(boutonClaim, boutonFermer);

        const embedTicket = new EmbedBuilder()
            .setTitle(`Ticket : ${labelChoisi}`)
            .setDescription(`Bienvenue ${interaction.user} !\nMotif : **${labelChoisi}**\n\nExplique ton problème ou ta demande. Un membre du staff va te répondre.`)
            .setColor(0x00FF00);

        const textePing = `${interaction.user} <@&${ticketConfig.staffRoleId}>`;

        await ticketChannel.send({ content: textePing, embeds: [embedTicket], components: [row] });
        await ticketChannel.send({
            content: `${interaction.user} Merci de préciser **pourquoi tu ouvres ce ticket** avant qu'un membre du staff le prenne en charge.\n\n👉 Explique clairement ton problème ou ta demande.`
        });

        const logEmbed = new EmbedBuilder()
            .setTitle('🎫 Ticket Ouvert')
            .setColor(0x00FFFF)
            .addFields(
                { name: 'Utilisateur', value: `${interaction.user.tag}`, inline: true },
                { name: 'Motif', value: labelChoisi, inline: true },
                { name: 'Salon', value: `${ticketChannel}`, inline: false }
            )
            .setTimestamp();
        await sendLog(interaction.guild, logEmbed);

        if (labelChoisi.toLowerCase().includes('rankup')) {
            const rankSelectMenu = new StringSelectMenuBuilder()
                .setCustomId(`select_rankup_${ticketChannel.id}`)
                .setPlaceholder('Choisis le grade visé...')
                .addOptions([
                    { label: 'Recruteur', value: 'recruteur', description: 'Postuler pour Recruteur' },
                    { label: 'Chef Recruteur', value: 'chef_recruteur', description: 'Postuler pour Chef Recruteur' },
                    { label: 'Leader', value: 'leader', description: 'Postuler pour Leader' },
                    { label: 'Co-Chef', value: 'cochef', description: 'Postuler pour Co-Chef' },
                    { label: 'Psychologue', value: 'psychologue', description: 'Postuler pour Psychologue' },
                    { label: 'Animateur', value: 'animateur', description: 'Postuler pour Animateur' },
                    { label: 'Co-Fonda', value: 'cofonda', description: 'Postuler pour Co-Fonda' }
                ]);
            const rankRow = new ActionRowBuilder().addComponents(rankSelectMenu);

            await ticketChannel.send({
                content: `📌 **${interaction.user}**, pour quel grade souhaites-tu faire ta demande de rankup ?`,
                components: [rankRow]
            });
        }

        await interaction.editReply({ content: `✅ Ton ticket a été créé avec succès : ${ticketChannel}` });
    }

    // --- 5. GESTION DU CHOIX DU GRADE DE RANKUP ---
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_rankup_')) {
        await interaction.deferUpdate();

        const selectedRank = interaction.values[0];
        const selectedOption = interaction.component.options.find(o => o.value === selectedRank);
        const nomGrade = selectedOption ? selectedOption.label : selectedRank;

        const fichesCandidature = {
            recruteur: `📋 **1. Fiche de Candidature — Pôle Recrutement**\n*(Pour les postes de Recruteur et Chef Recruteur)*\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et ton pseudo / Nom RP en jeu :\n- Ton âge réel et ton temps d'ancienneté exact dans la BMF :\n- Tes disponibilités hebdomadaires précises (heures/jours) et ton niveau de réactivité sur Discord :\n- Quelles sont tes expériences passées en recrutement ? :\n- **Mise en situation :** Tu fais passer un entretien vocal à un ami proche, mais il ne répond pas correctement aux critères requis. Que fais-tu ? :\n- **Mise en situation :** Un candidat s'énerve, te manque de respect ou tente de te corrompre/négocier son entrée. Quelle est ta réaction immédiate ? :\n- Pourquoi devrions-nous te faire confiance à TOI pour filtrer les futurs membres de la famille plutôt qu'à un autre ? :`,
            chef_recruteur: `📋 **Fiche de Candidature — Chef Recruteur**\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et ton pseudo / Nom RP en jeu :\n- Ton âge réel et ton temps d'ancienneté exact dans la BMF :\n- Quelles sont tes disponibilités hebdomadaires et ton niveau de réactivité sur Discord ? :\n- Quelle expérience as-tu en recrutement et qu'est-ce qui te motive à encadrer le pôle ? :\n- **Gestion d'équipe :** Deux recruteurs ne sont pas d'accord sur l'admission d'un candidat. Comment prends-tu une décision juste et comment accompagnes-tu ton équipe ? :\n- **Mise en situation :** Un recruteur accepte un ami qui ne répond pas aux critères. Comment réagis-tu ? :\n- Comment t'assureras-tu que les entretiens restent sérieux, impartiaux et cohérents entre tous les recruteurs ? :`,
            leader: `📋 **Fiche de Candidature — Pôle Terrain & Modération**\n*(Pour le poste de Leader)*\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et ton pseudo / Nom RP en jeu :\n- Ton âge réel et ton grade actuel au sein de la BMF :\n- Depuis combien de temps exactement es-tu dans la famille et dans le staff ? :\n- **Mise en situation :** Un gros conflit éclate en vocal entre deux membres influents (ou un ami et un inconnu). Décris étape par étape la procédure que tu appliques pour régler le problème. :\n- **Pédagogie vs Sanction :** À quel moment précis décides-tu d'arrêter d'expliquer et de sanctionner directement (derank/kick/ban) ? :\n- As-tu déjà reçu des sanctions (warns, jails, bans) sur le jeu ou Discord ? (La franchise est obligatoire, toute omission entraînera un refus définitif) :\n- Le rôle de Leader/Co-Chef exige une neutralité absolue et zéro copinage. Es-tu prêt(e) à sanctionner tes propres amis s'ils mettent le bordel dans la BMF ? :`,
            cochef: `📋 **Fiche de Candidature — Pôle Terrain & Modération**\n*(Pour le Co-Chef)*\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et ton pseudo / Nom RP en jeu :\n- Ton âge réel et ton grade actuel au sein de la BMF :\n- Depuis combien de temps exactement es-tu dans la famille et dans le staff ? :\n- **Mise en situation :** Un gros conflit éclate en vocal entre deux membres influents (ou un ami et un inconnu). Décris étape par étape la procédure que tu appliques pour régler le problème. :\n- **Pédagogie vs Sanction :** À quel moment précis décides-tu d'arrêter d'expliquer et de sanctionner directement (derank/kick/ban) ? :\n- As-tu déjà reçu des sanctions (warns, jails, bans) sur le jeu ou Discord ? (La franchise est obligatoire, toute omission entraînera un refus définitif) :\n- Le rôle de Leader/Co-Chef exige une neutralité absolue et zéro copinage. Es-tu prêt(e) à sanctionner tes propres amis s'ils mettent le bordel dans la BMF ? :`,
            psychologue: `📋 **Fiche de Candidature — Poste Psychologue (Max 2)**\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et ton nom IG :\n- Ton âge réel :\n- Pourquoi penses-tu avoir le sang-froid, la maturité et la neutralité nécessaires pour occuper ce poste critique ? :\n- **Test de confidentialité :** Un membre vient te confier en privé une information grave qui menace la sécurité ou la stabilité de la BMF (trahison, projet de leak, alliance secrète). Que fais-tu par rapport au secret professionnel ? :\n- **Mise en situation :** Deux membres très proches de toi s'embrouillent violemment et te demandent de prendre parti. Comment gères-tu la situation sans créer d'avantage pour l'un ou l'autre ? :\n- As-tu déjà été impliqué(e) de près ou de loin dans des dramas ou des embrouilles sur le serveur au cours des 3 derniers mois ? :`,
            animateur: `🎭 **Fiche de Candidature — Pôle Animation (Animateur)**\n\n> **INFORMATIONS REQUISES :**\n>\n> - Ton pseudo Discord et ton pseudo / Nom RP en jeu :\n> - Ton âge réel et ton temps d'ancienneté exact dans la BMF :\n> - Quelles sont tes disponibilités réelles (soirées, week-ends) pour organiser et animer des événements ?\n> - **Expérience & Créativité :** As-tu déjà organisé des événements (IG sur Roblox/School RP ou sur Discord) ? Donne des exemples concrets d'idées originales que tu souhaites mettre en place pour la BMF.\n> - **Gestion du public :** Lors d'un événement, du chaos ou des perturbateurs gâchent l'activité. Comment réagis-tu immédiatement pour garder le contrôle du vocal/du jeu sans élever la voix ni paniquer ?\n> - **Mise en situation :** Un événement que tu as préparé manque de participants au dernier moment. Que fais-tu pour rattraper le coup ?\n> - As-tu conscience que le rôle d'Animateur demande une présence régulière, du dynamisme et zéro prise de tête/favoritisme pendant les récompenses ?`,
            cofonda: `📋 **Fiche de Candidature — Haut Staff (Co-Fonda)**\n\n**INFORMATIONS REQUISES :**\n\n- Ton pseudo Discord et nom IG :\n- Depuis combien de mois es-tu actif/ve au quotidien dans le Staff BMF ? (Présence vérifiable) :\n- **Bilan complet :** Qu'as-tu concrètement apporté à la famille depuis ton arrivée (gestion, résolution de crises, présence) ? :\n- **Gestion technique & Bots :** Es-tu capable de configurer, créer et maintenir de A à Z les bots du serveur (tickets, rôles, modération, logs, perm) sans faire d'erreurs de sécurité ? :\n- **Investissement matériel/financier :** Quelle plus-value directe et concrète (financement de giveaways, boosts, bots payants, refonte de structures) vas-tu apporter immédiatement au serveur ? :\n- As-tu conscience qu'en tant que Co-Fonda, tu seras soumis(e) à une période d'essai de 14 jours avec une tolérance ZÉRO sur l'inactivité, le manque de loyauté ou les abus de pouvoir ? :`
        };

        const texteFiche = fichesCandidature[selectedRank] || "Fiche introuvable.";

        await interaction.message.delete().catch(() => {});

        await interaction.channel.send({
            content: `✅ Grade sélectionné : **${nomGrade}**\n\nVoici ta fiche de candidature. Copie-la, remplis-la et envoie-la ici :\n\n${texteFiche}`
        });
    }
}); // <-- Ferme l'écouteur global interactionCreate

async function addNormalQuestVoiceTime(guild, member, secondsSpent) {
    const voiceKey = getVoiceQuestKey(member.id, guild.id);
    if (secondsSpent <= 0 || normalVoiceQuestLocks.has(voiceKey)) return null;
    normalVoiceQuestLocks.add(voiceKey);

    try {
        if (!areNormalQuestsEnabled(guild.id)) return null;

        const { data, state, storageKey } = getQuestState(member.id, guild.id);
        if (!state.started) return { completed: false, active: false };

        const guildQuests = getNormalQuestsConfig(guild.id);
        const currentQuest = guildQuests[state.currentQuest];
        if (!currentQuest || (currentQuest.type !== 'voice' && currentQuest.type !== 'hybrid')) {
            return { completed: false, active: false };
        }

        state.voiceSeconds = (Number(state.voiceSeconds) || 0) + secondsSpent;
        if (currentQuest.type === 'voice') {
            state.progress = (Number(state.progress) || 0) + secondsSpent;
        }

        const hybridGoals = currentQuest.type === 'hybrid' ? getHybridQuestGoals(currentQuest) : null;
        const completed = currentQuest.type === 'voice'
            ? state.progress >= currentQuest.goal * 60
            : Number(state.messageCount || 0) >= hybridGoals.messageGoal &&
                state.voiceSeconds >= (hybridGoals.voiceSecondsGoal || 0);

        if (!completed) {
            data[storageKey] = state;
            saveQuestsData(data);
            return { completed: false };
        }

        const nextQuestNumber = state.currentQuest + 1;
        const nextQuest = guildQuests[nextQuestNumber];
        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.messageCount = 0;
        state.voiceSeconds = 0;
        state.completed = !nextQuest;
        state.started = true;
        data[storageKey] = state;
        saveQuestsData(data);

        await grantQuestRoleReward(guild, member, currentQuest.reward, currentQuest.roleId);

        const announcement = new EmbedBuilder()
            .setTitle('🎉 Quête validée !')
            .setDescription(`${member} a terminé la quête **${currentQuest.title}**.`)
            .addFields(
                { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                { name: '➡️ Prochaine étape', value: nextQuest ? `Tu passes maintenant à : **${nextQuest.title}**` : 'Toutes les quêtes sont terminées.', inline: false }
            )
            .setColor(0x00FF7F)
            .setTimestamp();

        await sendNormalQuestMessage(guild, {
            content: `${member}`,
            embeds: [announcement],
            components: [buildQuestOwnerButtons(member.id, {
                proof: nextQuest ? isProofQuest(nextQuest) : false,
                validateQuestNumber: nextQuestNumber
            })],
            allowedMentions: { users: [member.id] }
        });

        return { completed: true, nextQuest };
    } finally {
        normalVoiceQuestLocks.delete(voiceKey);
    }
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.member.bot) return;

    const memberId = newState.member.id;
    const guildId = newState.guild.id;
    const voiceKey = getVoiceQuestKey(memberId, guildId);
    await awardLevelVoiceState(oldState, newState);

    if (!oldState.channelId && newState.channelId) {
        specialVoiceQuestStart.set(voiceKey, Date.now());
    } else if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
        const specialStartedAt = specialVoiceQuestStart.get(voiceKey);
        if (specialStartedAt) {
            const secondsSpent = Math.max(0, Math.floor((Date.now() - specialStartedAt) / 1000));
            if (secondsSpent > 0) {
                await addSpecialQuestProgress(newState.guild, memberId, 'voice', secondsSpent);
            }
        }
        if (newState.channelId) {
            specialVoiceQuestStart.set(voiceKey, Date.now());
        } else {
            specialVoiceQuestStart.delete(voiceKey);
        }
    }

    if (!areNormalQuestsEnabled(guildId)) {
        voiceQuestStart.delete(voiceKey);
        return;
    }

    if (!oldState.channelId && !newState.channelId) return;

    const data = loadQuestsData();
    const storageKey = getQuestStorageKey(memberId, guildId);
    const state = normalizeQuestState(data[storageKey]);

    if (!state.started) {
        data[storageKey] = state;
        saveQuestsData(data);
        return;
    }

    const guildQuests = getNormalQuestsConfig(guildId);
    const currentQuest = guildQuests[state.currentQuest];

    if (!currentQuest || (currentQuest.type !== 'voice' && currentQuest.type !== 'hybrid')) {
        if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
            voiceQuestStart.delete(voiceKey);
        }
        return;
    }

    const hasJoinedVoice = !oldState.channelId && newState.channelId;
    const hasChangedVoice = oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId;
    const hasLeftVoice = oldState.channelId && (!newState.channelId || hasChangedVoice);

    if (hasJoinedVoice) {
        voiceQuestStart.set(voiceKey, Date.now());
        return;
    }

    if (hasLeftVoice) {
        const startedAt = voiceQuestStart.get(voiceKey);
        if (!startedAt) {
            if (hasChangedVoice) {
                voiceQuestStart.set(voiceKey, Date.now());
            }
            return;
        }

        const secondsSpent = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        if (secondsSpent > 0) {
            state.progress = (Number(state.progress) || 0) + secondsSpent;
            state.voiceSeconds = (Number(state.voiceSeconds) || 0) + secondsSpent;
            data[storageKey] = state;
            saveQuestsData(data);
        }
        voiceQuestStart.delete(voiceKey);

        if (currentQuest.type === 'voice' && state.progress >= currentQuest.goal * 60) {
            const nextQuestNumber = state.currentQuest + 1;
            const nextQuest = guildQuests[nextQuestNumber];
            state.currentQuest = nextQuestNumber;
            state.progress = 0;
            state.completed = !nextQuest;
            state.started = true;
            data[storageKey] = state;
            saveQuestsData(data);

            await grantQuestRoleReward(newState.guild, newState.member, currentQuest.reward, currentQuest.roleId);

            const member = newState.member;
            const congratEmbed = new EmbedBuilder()
                .setTitle('🎉 Quête validée !')
                .setDescription(`${member} a terminé la quête **${currentQuest.title}**.`)
                .addFields(
                    { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                    { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest ? nextQuest.title : 'Fin'}**`, inline: false }
                )
                .setColor(0x00FF7F)
                .setTimestamp();

            await sendNormalQuestMessage(newState.guild, {
                content: `${member}`,
                embeds: [congratEmbed],
                components: [buildQuestOwnerButtons(member.id, {
                    proof: nextQuest ? isProofQuest(nextQuest) : false,
                    validateQuestNumber: nextQuestNumber
                })],
                allowedMentions: { users: [member.id] }
            });
        }

        if (currentQuest.type === 'hybrid') {
            const goals = getHybridQuestGoals(currentQuest);
            const reached = Number(state.messageCount || 0) >= goals.messageGoal && Number(state.voiceSeconds || 0) >= (goals.voiceSecondsGoal || 0);
            if (reached) {
                const nextQuestNumber = state.currentQuest + 1;
                const nextQuest = guildQuests[nextQuestNumber];
                state.currentQuest = nextQuestNumber;
                state.progress = 0;
                state.messageCount = 0;
                state.voiceSeconds = 0;
                state.completed = !nextQuest;
                state.started = true;
                data[storageKey] = state;
                saveQuestsData(data);

                await grantQuestRoleReward(newState.guild, newState.member, currentQuest.reward, currentQuest.roleId);

                const member = newState.member;
                const congratEmbed = new EmbedBuilder()
                    .setTitle('🎉 Quête validée !')
                    .setDescription(`${member} a terminé la quête **${currentQuest.title}**.`)
                    .addFields(
                        { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                        { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest ? nextQuest.title : 'Fin'}**`, inline: false }
                    )
                    .setColor(0x00FF7F)
                    .setTimestamp();

                await sendNormalQuestMessage(newState.guild, {
                    content: `${member}`,
                    embeds: [congratEmbed],
                    components: [buildQuestOwnerButtons(member.id, {
                        proof: nextQuest ? isProofQuest(nextQuest) : false,
                        validateQuestNumber: nextQuestNumber
                    })],
                    allowedMentions: { users: [member.id] }
                });
            }
        }

        if (hasChangedVoice) {
            voiceQuestStart.set(voiceKey, Date.now());
        }
    }
});

setInterval(async () => {
    const now = Date.now();
    const questData = loadQuestsData();

    for (const guild of client.guilds.cache.values()) {
        if (!areNormalQuestsEnabled(guild.id)) continue;
        for (const channel of guild.channels.cache.values()) {
            if (!channel.isVoiceBased()) continue;
            for (const member of channel.members.values()) {
                if (member.user.bot) continue;
                const state = normalizeQuestState(questData[getQuestStorageKey(member.id, guild.id)]);
                const quest = getNormalQuestsConfig(guild.id)[state.currentQuest];
                const voiceKey = getVoiceQuestKey(member.id, guild.id);
                if (state.started && quest && (quest.type === 'voice' || quest.type === 'hybrid') && !voiceQuestStart.has(voiceKey)) {
                    voiceQuestStart.set(voiceKey, now);
                }
            }
        }
    }

    for (const [voiceKey, startedAt] of voiceQuestStart) {
        if (normalVoiceQuestLocks.has(voiceKey)) continue;
        const [guildId, memberId] = voiceKey.split(':');
        const guild = client.guilds.cache.get(guildId);
        const member = guild?.members.cache.get(memberId);
        if (!guild || !member?.voice.channelId || !areNormalQuestsEnabled(guildId)) {
            voiceQuestStart.delete(voiceKey);
            continue;
        }

        const secondsSpent = Math.floor((now - startedAt) / 1000);
        if (secondsSpent <= 0) continue;
        voiceQuestStart.set(voiceKey, startedAt + secondsSpent * 1000);

        try {
            const result = await addNormalQuestVoiceTime(guild, member, secondsSpent);
            if (result?.active === false ||
                result?.completed && (!result.nextQuest || (result.nextQuest.type !== 'voice' && result.nextQuest.type !== 'hybrid'))) {
                voiceQuestStart.delete(voiceKey);
            }
        } catch (err) {
            console.error(`Erreur pendant le suivi vocal de la quête pour ${memberId} sur ${guildId} :`, err);
        }
    }
}, 10_000);

client.on('messageDelete', async message => {
    await sendDeletedMessageLog(message);
});

async function captureQuestProofMessage(message) {
    const proofChannelId = (savedConfigs[message.guild.id] || {}).proofChannelId;
    if (!proofChannelId || message.channel.id !== proofChannelId) return false;

    const specialData = loadSpecialQuestsData();
    const guildState = specialData[message.guild.id] && getSpecialGuildState(specialData, message.guild.id);
    const specialOffer = guildState?.offers
        .filter(offer =>
            offer.proofRequests?.[message.author.id] &&
            !offer.proofSubmissions?.[message.author.id] &&
            !guildState.completedQuestNumbers.includes(Number(offer.questNumber)) &&
            (offer.status === 'legendary' || offer.status === 'claimed' && offer.claimedBy === message.author.id)
        )
        .sort((a, b) => Number(b.proofRequests[message.author.id]) - Number(a.proofRequests[message.author.id]))[0];
    const requests = loadQuestProofRequests();
    const normalRequestKey = `${message.guild.id}:${message.author.id}`;
    const normalRequest = requests[normalRequestKey];
    const normalRequestAt = Number(normalRequest?.requestedAt) > 0 && !normalRequest.submissionMessageId
        ? Number(normalRequest.requestedAt)
        : 0;
    const specialRequestAt = Number(specialOffer?.proofRequests?.[message.author.id]) || 0;
    const useSpecialOffer = specialRequestAt >= normalRequestAt && Boolean(specialOffer);
    if (!useSpecialOffer && !normalRequestAt) return false;

    const requestAt = useSpecialOffer ? specialRequestAt : normalRequestAt;
    const questNumber = useSpecialOffer ? Number(specialOffer.questNumber) : Number(normalRequest.questNumber);
    const isLegendary = useSpecialOffer && specialOffer.status === 'legendary';
    const isFlash = useSpecialOffer && !isLegendary;
    let quest;
    if (useSpecialOffer) {
        quest = SPECIAL_QUESTS_CONFIG[String(questNumber)];
    } else {
        const { state } = getQuestState(message.author.id, message.guild.id);
        const guildQuests = getNormalQuestsConfig(message.guild.id);
        if (!state.started || state.currentQuest !== questNumber || !isProofQuest(guildQuests[questNumber])) {
            delete requests[normalRequestKey];
            saveQuestProofRequests(requests);
            await message.reply('❌ Cette demande concerne une ancienne quête. Relance /quest et clique à nouveau sur « Preuve ».');
            return true;
        }
        quest = guildQuests[questNumber];
    }

    if (!requestAt || Date.now() - requestAt > DAY_MS) {
        if (useSpecialOffer) {
            delete specialOffer.proofRequests[message.author.id];
            saveSpecialQuestsData(specialData);
        } else {
            delete requests[normalRequestKey];
            saveQuestProofRequests(requests);
        }
        await message.reply('⌛ Ta demande de preuve a expiré. Clique à nouveau sur le bouton « Preuve » pour la renvoyer.');
        return true;
    }

    if (isLegendary) {
        const progress = specialOffer.progressByUser?.[message.author.id] || {};
        if (!hasReachedLegendaryActivityGoal(quest, progress)) {
            delete specialOffer.proofRequests[message.author.id];
            saveSpecialQuestsData(specialData);
            await message.reply('❌ Tu n’as pas encore atteint les objectifs suivis par le bot pour cette quête.');
            return true;
        }
    }

    const attachments = [...message.attachments.values()];
    const text = message.content.trim();
    if (!text && attachments.length === 0) {
        await message.reply('❌ Ajoute une explication ou une capture d’écran à ta preuve.');
        return true;
    }
    const imageAttachments = attachments.filter(attachment =>
        attachment.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(attachment.name || '')
    );
    const requiresImage = Number(questNumber) === TEST_LEGENDARY_QUEST_NUMBER ||
        /screen|capture d.?écran|photo/i.test(quest.description || '');
    if (requiresImage && imageAttachments.length === 0) {
        await message.reply('📸 Cette quête demande une capture d’écran. Ajoute une image au message pour envoyer ta preuve.');
        return true;
    }

    const proofEmbed = new EmbedBuilder()
        .setTitle(`📋 Preuve de quête • ${quest.title}`)
        .setDescription(text || 'Capture d’écran fournie par le membre.')
        .addFields(
            { name: 'Membre', value: `${message.author}`, inline: true },
            { name: 'Type', value: isLegendary ? 'Légendaire' : isFlash ? 'Flash' : 'Parcours normal', inline: true },
            { name: 'Images', value: String(imageAttachments.length), inline: true }
        )
        .setColor(isLegendary ? 0x8E44AD : isFlash ? 0xF0A500 : 0x3B82F6)
        .setTimestamp(message.createdTimestamp);
    const proofFiles = [];
    try {
        for (const attachment of attachments) {
            let fileBuffer;
            let downloadError;
            const downloadUrls = [...new Set([attachment.url, attachment.proxyURL].filter(Boolean))];
            for (const url of downloadUrls) {
                try {
                    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
                    if (!response.ok) {
                        throw new Error(`Téléchargement impossible (${response.status}).`);
                    }
                    const downloadedFile = Buffer.from(await response.arrayBuffer());
                    if (downloadedFile.length === 0) {
                        throw new Error('Le fichier téléchargé est vide.');
                    }
                    fileBuffer = downloadedFile;
                    break;
                } catch (err) {
                    downloadError = err;
                }
            }
            if (!fileBuffer) throw downloadError || new Error('Aucune URL de téléchargement disponible.');

            const extension = path.extname(attachment.name || '').match(/^\.[a-zA-Z0-9]{1,8}$/)?.[0] || '';
            proofFiles.push({
                attachment: fileBuffer,
                name: `quest-proof-${proofFiles.length + 1}${extension}`
            });
        }
    } catch (err) {
        console.error(`Impossible de recopier les pièces jointes de la preuve de ${message.author.id} :`, err);
        await message.reply('❌ Je n’ai pas pu recopier ta pièce jointe dans le dossier du staff. Ton message et ta preuve n’ont pas été supprimés ; réessaie ou contacte le staff.');
        return true;
    }

    const uploadedNameByUrl = new Map(
        attachments.map((attachment, index) => [attachment.url, proofFiles[index].name])
    );
    if (imageAttachments.length > 0) {
        proofEmbed.setImage(`attachment://${uploadedNameByUrl.get(imageAttachments[0].url)}`);
    }
    const proofEmbeds = [
        proofEmbed,
        ...imageAttachments.slice(1, 10).map((attachment, index) =>
            new EmbedBuilder()
                .setImage(`attachment://${uploadedNameByUrl.get(attachment.url)}`)
                .setColor(isLegendary ? 0x8E44AD : isFlash ? 0xF0A500 : 0x3B82F6)
                .setFooter({ text: `Image ${index + 2} sur ${imageAttachments.length}` })
        )
    ];
    const displayedImageUrls = new Set(imageAttachments.slice(0, 10).map(attachment => attachment.url));
    const otherAttachments = attachments.filter(attachment => !displayedImageUrls.has(attachment.url));
    if (otherAttachments.length > 0) {
        proofEmbed.addFields({
            name: 'Fichiers joints',
            value: otherAttachments.map(attachment => `• ${attachment.name || 'Fichier'} (joint au dossier ci-dessous)`).join('\n').slice(0, 1024)
        });
    }

    const validationButton = new ButtonBuilder()
        .setCustomId(isLegendary
            ? `special_legendary_validate_${questNumber}_${message.author.id}`
            : isFlash
                ? `special_flash_validate_${questNumber}_${message.author.id}`
                : `staff_validate_proof_${message.author.id}_${questNumber}`)
        .setLabel('Valider cette preuve')
        .setStyle(ButtonStyle.Success);
    const rejectButton = new ButtonBuilder()
        .setCustomId(isLegendary
            ? `special_legendary_reject_${questNumber}_${message.author.id}`
            : isFlash
                ? `special_flash_reject_${questNumber}_${message.author.id}`
                : `staff_reject_proof_${message.author.id}_${questNumber}`)
        .setLabel('Refuser cette preuve')
        .setStyle(ButtonStyle.Danger);
    let reviewMessage;
    try {
        reviewMessage = await message.channel.send({
            embeds: proofEmbeds,
            files: proofFiles,
            components: [new ActionRowBuilder().addComponents(validationButton, rejectButton)],
            allowedMentions: { parse: [] }
        });
    } catch (err) {
        console.error(`Impossible de publier le dossier de preuve de ${message.author.id} :`, err);
        await message.reply('❌ Je n’ai pas pu transmettre ta preuve au staff. Ton message et ta pièce jointe sont conservés ; vérifie la taille du fichier ou contacte le staff.');
        return true;
    }

    if (useSpecialOffer) {
        specialOffer.proofSubmissions ||= {};
        specialOffer.proofSubmissions[message.author.id] = {
            messageId: reviewMessage.id,
            sourceMessageId: message.id,
            submittedAt: message.createdTimestamp
        };
        delete specialOffer.proofRequests[message.author.id];
        saveSpecialQuestsData(specialData);
    } else {
        normalRequest.submissionMessageId = reviewMessage.id;
        normalRequest.sourceMessageId = message.id;
        normalRequest.submittedAt = message.createdTimestamp;
        saveQuestProofRequests(requests);
    }
    try {
        await message.delete();
    } catch (err) {
        console.error('La preuve a été transmise, mais le message original n’a pas pu être supprimé :', err);
        await message.reply('✅ Ta preuve a été envoyée au staff, mais je n’ai pas pu supprimer ton message. Vérifie que le bot a la permission « Gérer les messages ».')
            .catch(replyError => console.error('Impossible de prévenir le membre que son message original n’a pas été supprimé :', replyError));
    }
    return true;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    await addSpecialQuestProgress(message.guild, message.author.id, 'message', 1);
    try {
        if (await captureQuestProofMessage(message)) return;
    } catch (err) {
        console.error('Erreur lors de la réception d’une preuve de quête :', err);
        await message.reply('❌ La preuve n’a pas pu être transmise. Réessaie ou préviens un membre du staff.')
            .catch(replyError => console.error('Impossible de prévenir le membre de l’échec de sa preuve :', replyError));
        return;
    }
    await awardMessageXp(message);
    if (!areNormalQuestsEnabled(message.guild.id)) return;

    const data = loadQuestsData();
    const storageKey = getQuestStorageKey(message.author.id, message.guild.id);
    const state = normalizeQuestState(data[storageKey]);

    if (!state.started) {
        data[storageKey] = state;
        saveQuestsData(data);
        return;
    }

    const currentQuestNumber = state.currentQuest;
    const guildQuests = getNormalQuestsConfig(message.guild.id);
    const currentQuest = guildQuests[currentQuestNumber] || {
        title: 'Quêtes terminées',
        description: 'Tu as terminé toutes les quêtes disponibles.',
        goal: 100,
        reward: 'Récompense exceptionnelle / giveaway staff',
        type: 'messages'
    };

    if (currentQuest.type === 'messages') {
        state.progress += 1;
    }

    if (currentQuest.type === 'hybrid') {
        const goals = getHybridQuestGoals(currentQuest);
        state.messageCount = (Number(state.messageCount) || 0) + 1;
        state.progress = state.messageCount;

        if (state.messageCount >= goals.messageGoal && Number(state.voiceSeconds || 0) >= (goals.voiceSecondsGoal || 0)) {
            const nextQuestNumber = currentQuestNumber + 1;
            const nextQuest = guildQuests[nextQuestNumber];

            state.currentQuest = nextQuestNumber;
            state.progress = 0;
            state.messageCount = 0;
            state.completed = !nextQuest;
            state.started = true;
            data[storageKey] = state;
            saveQuestsData(data);

            await grantQuestRoleReward(message.guild, message.member, currentQuest.reward, currentQuest.roleId);

            const congratEmbed = new EmbedBuilder()
                .setTitle('🎉 Quête validée !')
                .setDescription(`${message.author} a terminé la quête **${currentQuest.title}**.`)
                .addFields(
                    { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                    { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest ? nextQuest.title : 'Fin'}**`, inline: false },
                    { name: '🎯 Objectif', value: nextQuest ? `Atteindre **${nextQuest.title}**` : 'Toutes les quêtes sont terminées.', inline: false }
                )
                .setColor(0x00FF7F)
                .setTimestamp();

            await sendNormalQuestMessage(message.guild, {
                content: `${message.author}`,
                embeds: [congratEmbed],
                components: [buildQuestOwnerButtons(message.author.id, {
                    proof: nextQuest ? isProofQuest(nextQuest) : false,
                    validateQuestNumber: nextQuestNumber
                })],
                allowedMentions: { users: [message.author.id] }
            });
            return;
        }
    }

    if (state.progress >= currentQuest.goal) {
        if (guildQuests[currentQuestNumber + 1]) {
            const nextQuestNumber = currentQuestNumber + 1;
            const nextQuest = guildQuests[nextQuestNumber];

            state.currentQuest = nextQuestNumber;
            state.progress = 0;
            state.completed = !nextQuest;
            state.started = true;
            data[storageKey] = state;
            saveQuestsData(data);

            await grantQuestRoleReward(message.guild, message.member, currentQuest.reward, currentQuest.roleId);

            const actionText = getQuestGoalText(nextQuest);

            const congratEmbed = new EmbedBuilder()
                .setTitle('🎉 Quête validée !')
                .setDescription(`${message.author} a terminé la quête **${currentQuest.title}**.`)
                .addFields(
                    { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                    { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest.title}**`, inline: false },
                    { name: '🎯 Objectif', value: `${actionText} ${nextQuest.goal} ${nextQuest.type === 'messages' ? 'messages' : nextQuest.type === 'reaction' ? 'réactions' : nextQuest.type === 'voice' ? 'minutes de vocal' : nextQuest.type === 'invite' ? 'invites' : 'points'} pour la valider.`, inline: false }
                )
                .setColor(0x00FF7F)
                .setTimestamp();

            await sendNormalQuestMessage(message.guild, {
                content: `${message.author}`,
                embeds: [congratEmbed],
                components: [buildQuestOwnerButtons(message.author.id, {
                    proof: isProofQuest(nextQuest),
                    validateQuestNumber: nextQuestNumber
                })],
                allowedMentions: { users: [message.author.id] }
            });

            const guildConfig = savedConfigs[message.guild.id] || {};
            const questLogChannelId = guildConfig.questLogChannelId;
            const questPingRoleId = guildConfig.questPingRoleId;

            if (questLogChannelId) {
                const logChannel = await message.guild.channels.fetch(questLogChannelId).catch(() => null);
                if (logChannel) {
                    const pingText = questPingRoleId ? `<@&${questPingRoleId}>` : '';
                    const questLogEmbed = new EmbedBuilder()
                        .setTitle('✅ Quête validée')
                        .setDescription(`${message.author} a validé la quête **${currentQuest.title}** et a gagné : **${getQuestRewardDisplay(currentQuest)}**.`)
                        .addFields(
                            { name: '📌 Prochaine quête', value: `${nextQuest.title}`, inline: false },
                            { name: '🎯 Objectif suivant', value: `${actionText} ${nextQuest.goal} ${nextQuest.type === 'messages' ? 'messages' : nextQuest.type === 'reaction' ? 'réactions' : nextQuest.type === 'voice' ? 'minutes de vocal' : nextQuest.type === 'invite' ? 'invites' : 'points'}.`, inline: false }
                        )
                        .setColor(0x00FF7F)
                        .setTimestamp();

                    await logChannel.send({ content: pingText || undefined, embeds: [questLogEmbed] }).catch(() => {});
                }
            }
            return;
        }

        state.completed = true;
        state.progress = currentQuest.goal;
        data[storageKey] = state;
        saveQuestsData(data);

        const finalEmbed = new EmbedBuilder()
            .setTitle('🏆 Toutes les quêtes terminées !')
            .setDescription(`**${message.author.tag}** a fini toutes les quêtes disponibles.`)
            .addField('🎁 Récompense finale', 'Récompense exceptionnelle / giveaway staff', true)
            .setColor(0xFFD700)
            .setTimestamp();

        await sendNormalQuestMessage(message.guild, {
            content: `${message.author}`,
            embeds: [finalEmbed],
            allowedMentions: { users: [message.author.id] }
        });

        const guildConfig = savedConfigs[message.guild.id] || {};
        const questLogChannelId = guildConfig.questLogChannelId;
        const questPingRoleId = guildConfig.questPingRoleId;

        if (questLogChannelId) {
            const logChannel = await message.guild.channels.fetch(questLogChannelId).catch(() => null);
            if (logChannel) {
                const pingText = questPingRoleId ? `<@&${questPingRoleId}>` : '';
                const finalLogEmbed = new EmbedBuilder()
                    .setTitle('🏆 Dernière quête validée')
                    .setDescription(`${message.author} a fini la dernière quête : **${currentQuest.title}** et a gagné la récompense finale.`)
                    .addField('🎁 Récompense', 'Récompense exceptionnelle / giveaway staff', true)
                    .setColor(0xFFD700)
                    .setTimestamp();

                await logChannel.send({ content: pingText || undefined, embeds: [finalLogEmbed] }).catch(() => {});
            }
        }
        return;
    }

    data[storageKey] = state;
    saveQuestsData(data);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        if (reaction.message.guild && reaction.emoji.name === TOKEN_DROP_EMOJI) {
            const reward = claimTokenDrop(
                reaction.message.guild.id,
                reaction.message.id,
                user.id
            );
            if (reward) {
                const embed = new EmbedBuilder()
                    .setTitle('🎁 Cadeau de jetons remporté !')
                    .setDescription(`${user} est la première personne à avoir réagi et gagne **${reward.amount} jetons** !`)
                    .addFields({ name: 'Nouveau solde', value: `${reward.balance} jetons`, inline: true })
                    .setColor(0x2ECC71)
                    .setTimestamp();
                await reaction.message.edit({ embeds: [embed] });
            }
        }
    } catch (err) {
        console.error('Erreur lors du traitement d’un cadeau de jetons :', err);
    }

    if (reaction.message.guild) {
        await addSpecialQuestProgress(reaction.message.guild, user.id, 'reaction', 1);
        if (!areNormalQuestsEnabled(reaction.message.guild.id)) return;
    }

    const data = loadQuestsData();
    const storageKey = getQuestStorageKey(user.id, reaction.message.guild.id);
    const state = normalizeQuestState(data[storageKey]);

    if (!state.started) {
        data[storageKey] = state;
        saveQuestsData(data);
        return;
    }

    const guildQuests = getNormalQuestsConfig(reaction.message.guild.id);
    const currentQuest = guildQuests[state.currentQuest];

    if (!currentQuest || currentQuest.type !== 'reaction') return;

    state.progress += 1;

    if (state.progress >= currentQuest.goal) {
        const nextQuestNumber = state.currentQuest + 1;
        const nextQuest = guildQuests[nextQuestNumber];

        state.currentQuest = nextQuestNumber;
        state.progress = 0;
        state.completed = !nextQuest;
        state.started = true;
        data[storageKey] = state;
        saveQuestsData(data);

        await grantQuestRoleReward(reaction.message.guild, user, currentQuest.reward, currentQuest.roleId);

        const congratEmbed = new EmbedBuilder()
            .setTitle('🎉 Quête validée !')
            .setDescription(`${user} a terminé la quête **${currentQuest.title}**.`)
            .addFields(
                { name: '🏆 Récompense gagnée', value: getQuestRewardDisplay(currentQuest), inline: false },
                { name: '➡️ Prochaine étape', value: `Tu passes maintenant à : **${nextQuest ? nextQuest.title : 'Fin'}**`, inline: false },
                { name: '🎯 Objectif', value: nextQuest ? `Réagir à ${nextQuest.goal} messages pour la valider.` : 'Toutes les quêtes sont terminées.', inline: false }
            )
            .setColor(0x00FF7F)
            .setTimestamp();

        await sendNormalQuestMessage(reaction.message.guild, {
            content: `${user}`,
            embeds: [congratEmbed],
            components: [buildQuestOwnerButtons(user.id, {
                proof: nextQuest ? isProofQuest(nextQuest) : false,
                validateQuestNumber: nextQuestNumber
            })],
            allowedMentions: { users: [user.id] }
        });

        const guildConfig = savedConfigs[reaction.message.guild.id] || {};
        const questLogChannelId = guildConfig.questLogChannelId;
        const questPingRoleId = guildConfig.questPingRoleId;

        if (questLogChannelId) {
            const logChannel = await reaction.message.guild.channels.fetch(questLogChannelId).catch(() => null);
            if (logChannel) {
                const pingText = questPingRoleId ? `<@&${questPingRoleId}>` : '';
                const questLogEmbed = new EmbedBuilder()
                    .setTitle('✅ Quête validée')
                    .setDescription(`${user} a validé la quête **${currentQuest.title}** et a gagné : **${getQuestRewardDisplay(currentQuest)}**.`)
                    .addFields(
                        { name: '📌 Prochaine quête', value: `${nextQuest ? nextQuest.title : 'Aucune'}`, inline: false },
                        { name: '🎯 Objectif suivant', value: nextQuest ? `Réagir à ${nextQuest.goal} messages.` : 'La suite est terminée.', inline: false }
                    )
                    .setColor(0x00FF7F)
                    .setTimestamp();

                await logChannel.send({ content: pingText || undefined, embeds: [questLogEmbed] }).catch(() => {});
            }
        }
        return;
    }

    data[storageKey] = state;
    saveQuestsData(data);
});

setInterval(async () => {
    for (const [key, session] of levelVoiceStart) {
        const [guildId, userId] = key.split(':');
        const guild = client.guilds.cache.get(guildId);
        const member = guild?.members.cache.get(userId);
        if (!guild || !member?.voice.channelId) {
            levelVoiceStart.delete(key);
            continue;
        }
        try {
            await awardLevelVoiceSession(guild, userId, session);
        } catch (err) {
            console.error(`Erreur XP vocal pour ${userId} :`, err);
        }
    }
}, 15 * 1000);

setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
        try {
            await processSpecialQuestsForGuild(guild);
        } catch (err) {
            console.error(`Erreur traitement des quêtes spéciales ${guild.name} :`, err);
        }
    }
}, 60 * 1000);

setInterval(async () => {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const channel = guild.channels.cache.find(ch => ch.name === 'classement-quetes' && ch.isTextBased && typeof ch.send === 'function');
        if (!channel) return;

        const data = loadQuestsData();
        const entries = Object.entries(data)
            .filter(([, value]) => value && typeof value === 'object')
            .map(([key, value]) => {
                const [guildId, userId] = String(key).split(':');
                return {
                    guildId,
                    userId: userId || key,
                    currentQuest: Number(value.currentQuest) || 1,
                    progress: Number(value.progress) || 0,
                    completed: Boolean(value.completed)
                };
            })
            .filter(entry => !entry.guildId || entry.guildId === guild.id)
            .sort((a, b) => b.currentQuest - a.currentQuest || b.progress - a.progress)
            .slice(0, 10);

        const leaderboardRows = await Promise.all(entries.map(async entry => {
            try {
                const user = await client.users.fetch(entry.userId);
                return { displayName: getCanvasDisplayName(user), currentQuest: entry.currentQuest };
            } catch {
                return { displayName: 'Utilisateur inconnu', currentQuest: entry.currentQuest };
            }
        }));

        const fileName = 'classement-quetes.png';
        const boardImage = await createQuestLeaderboardImage(
            leaderboardRows,
            null,
            'CLASSEMENT AUTOMATIQUE',
            getQuestLeaderboardSettings(guild.id)
        );
        const attachment = new AttachmentBuilder(boardImage, { name: fileName });
        await channel.send({ files: [attachment] });
    } catch (err) {
        console.error('Erreur classement quêtes :', err);
    }
}, 60 * 60 * 1000);

setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
        const guildConfig = savedConfigs[guild.id] || {};
        if (!guildConfig.tokenDropChannelId) continue;

        const nextDropAt = Number(guildConfig.nextTokenDropAt) || 0;
        if (nextDropAt > Date.now()) continue;

        const tokenData = loadTokensData();
        const activeDrop = tokenData[guild.id]?.activeDrop;
        if (activeDrop && !activeDrop.claimedBy && Number(activeDrop.expiresAt) > Date.now()) {
            guildConfig.nextTokenDropAt = Date.now() + 6 * 60 * 60 * 1000;
            saveConfigsToFile();
            continue;
        }

        try {
            const channel = await guild.channels.fetch(guildConfig.tokenDropChannelId);
            if (!channel?.isTextBased() || typeof channel.send !== 'function') {
                throw new Error('Le salon configuré pour les cadeaux de jetons n’est pas textuel.');
            }
            const amount = 100 + Math.floor(Math.random() * 201);
            await publishTokenDrop(guild, channel, amount);
            guildConfig.nextTokenDropAt = Date.now() + getRandomTokenDropDelay();
            saveConfigsToFile();
        } catch (err) {
            console.error(`Erreur lors du lancement automatique du cadeau de jetons sur ${guild.name} :`, err);
            guildConfig.nextTokenDropAt = Date.now() + 60 * 60 * 1000;
            saveConfigsToFile();
        }
    }
}, 5 * 60 * 1000);

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Le bot Discord est en ligne !');
}).listen(process.env.PORT || 3000);

client.login(DISCORD_TOKEN); // <-- Lancement final