import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? {
    conn: null,
    promise: null,
};

global.mongoose = cached;

function getMongoDBUri(): string {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Please define MONGODB_URI in .env.local");
    }

    return uri;
}

export async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = getMongoDBUri();

        cached.promise = mongoose.connect(uri);
    }

    cached.conn = await cached.promise;

    return cached.conn;
}
