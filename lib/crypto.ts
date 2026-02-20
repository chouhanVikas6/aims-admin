const KEY_B64 = "kCSDOt+K3DKwNvNHBWOpXJKbTrDsIK0L7VdQ3z9LKVM=";

export type EncryptedPayload = {
    iv: string;
    tag: string;
    data: string;
};

async function getKey(usage: KeyUsage[]): Promise<CryptoKey> {
    if (!KEY_B64) throw new Error("Encryption key is missing");

    return window.crypto.subtle.importKey(
        "raw",
        Uint8Array.from(atob(KEY_B64), (c) => c.charCodeAt(0)),
        { name: "AES-GCM" },
        false,
        usage
    );
}

export async function encryptPayload(data: unknown): Promise<EncryptedPayload> {
    const key = await getKey(["encrypt"]);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
    );

    // Extract tag (last 16 bytes) and ciphertext
    // Web Crypto API returns ciphertext + tag concatenated
    const encryptedBytes = new Uint8Array(encrypted);
    const tagLength = 16;
    const ciphertext = encryptedBytes.slice(0, -tagLength);
    const tag = encryptedBytes.slice(-tagLength);

    return {
        iv: btoa(String.fromCharCode(...iv)),
        tag: btoa(String.fromCharCode(...tag)),
        data: btoa(String.fromCharCode(...ciphertext)),
    };
}

export async function decryptPayload(payload: EncryptedPayload): Promise<unknown> {
    const key = await getKey(["decrypt"]);

    const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
    const tag = Uint8Array.from(atob(payload.tag), (c) => c.charCodeAt(0));
    const data = Uint8Array.from(atob(payload.data), (c) => c.charCodeAt(0));

    // Combine data + tag for Web Crypto API
    const encryptedData = new Uint8Array(data.length + tag.length);
    encryptedData.set(data, 0);
    encryptedData.set(tag, data.length);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedData
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
}
