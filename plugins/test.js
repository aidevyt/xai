// plugins/unfollow.js

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== HELPER: Extract channel info from link or JID ====================
async function getChannelInfo(conn, input) {
    let channelJid;
    let channelName = '';
    let inviteId = null;

    if (input.includes('whatsapp.com/channel/')) {
        const match = input.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) return null;

        inviteId = match[1];

        try {
            const metadata = await conn.newsletterMetadata("invite", inviteId);
            channelJid = metadata.id;
            channelName = metadata.name || 'Unknown';
        } catch (e) {
            return null;
        }
    } else if (input.includes('@newsletter')) {
        channelJid = input;
        channelName = input.split('@')[0];
    } else {
        return null;
    }

    return { channelJid, channelName, inviteId };
}

// ==================== UNFOLLOW COMMAND ====================
cmd({
    pattern: "unfollowx",
    alias: ["unsubscribe"],
    react: "🔕",
    desc: "Unfollow WhatsApp newsletter channel",
    category: "owner",
    use: ".unfollow <channel_link_or_jid>",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*

📌 *Usage:*
• .unfollow https://whatsapp.com/channel/xxxxxxxxx
• .unfollow 120363424332765515@newsletter`);
        }

        await react('⏳');
        const channelInfo = await getChannelInfo(conn, args[0]);

        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*`);
        }

        const channelJid = channelInfo.channelJid;

        await conn.newsletterUnfollow(channelJid);

        await react('✅');
        await reply(`✅ *Unfollowed successfully!*

📢 *Channel:* ${channelInfo.channelName || 'Unknown'}
🆔 *JID:* ${channelJid}

> *© Powered By KHAN-MD-♡*`);

    } catch (error) {
        console.error("Unfollow error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});
