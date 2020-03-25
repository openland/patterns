import { backoff } from "../timer/backoff";

export class InvalidateSync {
    private _invalidated = false;
    private _invalidatedDouble = false;
    private _command: () => Promise<void>;

    constructor(command: () => Promise<void>) {
        this._command = command;
    }

    invalidate() {
        if (!this._invalidated) {
            this._invalidated = true;
            this._invalidatedDouble = false;
            this._doSync();
        }
        if (!this._invalidatedDouble) {
            this._invalidatedDouble = true;
        }
    }

    private _doSync = async () => {
        await backoff(async () => {
            await this._command();
        });
        if (this._invalidatedDouble) {
            this._invalidatedDouble = false;
            this._doSync();
        } else {
            this._invalidated = false;
        }
    }
}