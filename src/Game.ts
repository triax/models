import Team, { TeamPropsObject } from "./Team";
import { Base } from "./base";
import Errors from "./errors";

// enum "Status" represents the status of the game
export enum Status {
    DRAFT = "draft", // つくったけどまだ見せない
    STANDBY = "standby", // 見せてよいけど始まってない
    ONGOING = "ongoing", // 始まってる
    FINISHED = "finished", // 終わったし、投票も受け付けないが、表示はできる
    CLOSED = "closed", // 終わってるし、見せもしない
    UNKNOWN = "unknown", // なんかよくわからん
}

interface GamePropsObject {
    id?: string;
    status?: string;
    kick_off: Date;
    game_set: Date;
    venue: string;
    home: TeamPropsObject;
    visitor: TeamPropsObject;
    result?: {
        ended: Date;
        home: number;
        visitor: number;
    };
}

export default class Game extends Base {
    static override path = "games";

    status: Status = Status.DRAFT;
    kick_off: Date;
    game_set: Date;
    venue: string;

    home: Team;
    visitor: Team;

    result: {
        ended: Date;
        home: number;
        visitor: number;
    } | null;

    constructor(props: GamePropsObject) {
        super(props.id);
        this.status = (props.status as Status) || Status.DRAFT;
        this.kick_off = new Date((props.kick_off as any).seconds * 1000);
        this.game_set = new Date((props.game_set as any).seconds * 1000);
        this.venue = props.venue;
        this.home = new Team(props.home);
        this.visitor = new Team(props.visitor);
        this.result = props.result || null;
    }

    override encode(): GamePropsObject {
        return {
            ...(this.id ? { id: this.id } : {}),
            ...(this.result ? { result: this.result } : null),
            status: this.status || Status.DRAFT,
            kick_off: this.kick_off,
            game_set: this.game_set,
            venue: this.venue,
            home: this.home.encode(),
            visitor: this.visitor.encode(),
        };
    }

    static empty(): Game {
        return new Game({
            kick_off: new Date(),
            game_set: new Date(),
            venue: "",
            home: Team.empty().encode(),
            visitor: Team.empty().encode(),
        });
    }

    override validate(): Errors | null {
        const errors: Errors = {};
        if (this.kick_off.getTime() < Date.now()) {
            errors["kick_off"] = { key: "kick_off", message: "キックオフの時間が不正です" };
        }
        if (this.game_set.getTime() < this.kick_off.getTime()) {
            errors["game_set"] = { key: "game_set", message: "試合終了の時間が不正です" };
        }
        if (this.venue.trim().length === 0) {
            errors["venue"] = { key: "venue", message: "会場が不正です" };
        }
        if (this.home.id == this.visitor.id) {
            errors["home"] = { key: "home", message: "ホームチームとビジターチームが同じです" };
            errors["visitor"] = { key: "visitor", message: "ホームチームとビジターチームが同じです" };
        }
        const homeErrors = this.home.validate();
        if (homeErrors) {
            Object.keys(homeErrors).forEach(key => {
                errors[`home.${key}`] = homeErrors[key];
            });
        }
        const visitorErrors = this.visitor.validate();
        if (visitorErrors) {
            Object.keys(visitorErrors).forEach(key => {
                errors[`visitor.${key}`] = visitorErrors[key];
            });
        }
        return Object.keys(errors).length > 0 ? errors : null;
    }

    getStatus(): Status {
        if (this.status === Status.DRAFT) {
            return Status.DRAFT;
        }
        if (this.status === Status.CLOSED) {
            return Status.CLOSED;
        }
        if (this.status === Status.FINISHED) {
            return Status.FINISHED;
        }
        if (this.result) {
            return Status.FINISHED;
        }
        if (this.status == Status.ONGOING) {
            return Status.ONGOING;
        }
        if (this.status == Status.STANDBY) {
            if (this.kick_off.getTime() < Date.now()) {
                return Status.ONGOING;
            }
            return Status.STANDBY;
        }
        return Status.UNKNOWN;
    }
}