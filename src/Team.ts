import { Base } from "./base";
import Errors from "./errors";

export interface TeamPropsObject {
    id?: string;
    name: string;
    name_yomi: string;
    color_primary?: string;
    color_secondary?: string;
    homepage_url?: string;
    icon_image_url?: string;
}

export default class Team extends Base {
    static path = "teams";

    public name: string;
    public name_yomi: string;
    public icon_image_url?: string;
    public color_primary?: string;
    public color_secondary?: string;
    public homepage_url?: string;
    constructor(props: TeamPropsObject) {
        super(props.id);
        this.name = props.name;
        this.name_yomi = props.name_yomi;
        this.homepage_url = props.homepage_url;
        this.color_primary = props.color_primary;
        this.color_secondary = props.color_secondary;
        this.icon_image_url = props.icon_image_url;
    }

    public static empty(): Team {
        return new Team({
            id: "__null__",
            name: "", name_yomi: "",
            homepage_url: "",
            color_primary: "#303030", color_secondary: "#303030"
        });
    }

    override encode(): TeamPropsObject {
        return {
            name: this.name,
            name_yomi: this.name_yomi,
            color_primary: this.color_primary,
            color_secondary: this.color_secondary,
            homepage_url: this.homepage_url,
            ...(this.id ? { id: this.id } : {}),
            ...(this.icon_image_url ? { icon_image_url: this.icon_image_url } : {}),
        };
    }
    override validate(): Errors | null {
        const errors: { [key: string]: { key: string; message: string; } } = {};
        if (this.id == "__null__") errors["id"] = { key: "id", message: "idが不正です" };
        try {
            new URL(this.homepage_url ?? "");
        } catch (e) {
            errors["homepage_url"] = { key: "homepage_url", message: "ホームページのURLが不正です" };
        }
        if (this.name.trim().length === 0) {
            errors["name"] = { key: "name", message: "チーム名を入力してください" };
        }
        if (this.name_yomi.trim().length === 0) {
            errors["name_yomi"] = { key: "name_yomi", message: "チーム名(よみ)を入力してください" };
        }
        return Object.keys(errors).length > 0 ? errors : null;
    }
}