import {
    PublicClientApplication,
    Configuration,
    LogLevel,
} from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;

if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_AZURE_CLIENT_ID");
}

if (!tenantId) {
    throw new Error("Missing NEXT_PUBLIC_AZURE_TENANT_ID");
}

const msalConfig: Configuration = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri:
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
        postLogoutRedirectUri:
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
    },

    cache: {
        cacheLocation: "sessionStorage",
    },

    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;

                if (level === LogLevel.Error) {
                    console.error(message);
                }

                if (level === LogLevel.Warning) {
                    console.warn(message);
                }
            },
        },
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
    scopes: ["openid", "profile", "email"],
};