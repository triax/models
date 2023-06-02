import { type FirebaseOptions, initializeApp } from "firebase/app";
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, updateDoc, type Firestore } from "firebase/firestore";
import Errors from "./errors";

type ModelConstructor<T> = {
    get<T>(id: string): Promise<T|null>;
    new(props?: any): T;
}

export class Base {

    protected static database: Firestore;
    public static init(options: FirebaseOptions, name?: string): void {
        this.database = getFirestore(initializeApp(options, name));
    }

    static path: string;
    id?: string;
    constructor(id?: string) {
        this.id = id;
    }
    encode(): Record<string, any> {
        throw Error("`encode` method must be implemented by subclass");
    }
    validate(): Errors | null {
        throw Error("`validate` method must be implemented by subclass");
    }
    async upsert<T extends Base>(this: T, path = (<any>this).constructor.path): Promise<T> {
        if (this.id) {
            const ref = doc(Base.database, path, this.id);
            await updateDoc(ref, this.encode());
            return this;
        } else {
            const col = collection(Base.database, path);
            const ref = await addDoc(col, this.encode());
            this.id = ref.id;
            return this;
        }
    }

    static async get<T>(this: ModelConstructor<T>, id: string): /* Promise<T> */ Promise<T|null> {
        const path = (<any>this).path;
        const ref = doc(Base.database, path, id);
        const snapshot = await getDoc(ref);
        return new this({
            id: snapshot.id,
            ...snapshot.data(),
        });
    }

    static async list<T>(this: ModelConstructor<T>, path: string = (<any>this).path): Promise<T[]> {
        const ref = collection(Base.database, path);
        const snapshot = await getDocs(ref)
        return snapshot.docs.map(doc => new this({
            id: doc.id,
            ...doc.data(),
        }));
    }
}