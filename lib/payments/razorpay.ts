import Razorpay from "razorpay";

function createRazorpay(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId) {
        throw new Error(
            "RAZORPAY_KEY_ID is not configured.",
        );
    }

    if (!keySecret) {
        throw new Error(
            "RAZORPAY_KEY_SECRET is not configured.",
        );
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
    if (!razorpayInstance) {
        razorpayInstance = createRazorpay();
    }

    return razorpayInstance;
}

export const razorpay = new Proxy({} as Razorpay, {
    get(_target, property, receiver) {
        const instance = getRazorpayInstance();

        return Reflect.get(instance, property, receiver);
    },
});