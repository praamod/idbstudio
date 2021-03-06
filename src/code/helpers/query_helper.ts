import { API } from "../enum";

export class QueryHelper {
    query: string;
    errMessage: string = "";
    constructor(query) {
        this.query = query;
    }

    getQuery() {
        var qry;
        var isAnyApiFound = false;
        this.allowedApi.forEach((api) => {
            // every api call will have a open paranthesis after
            const index = this.query.indexOf(api + "(");
            if (index >= 0) {
                isAnyApiFound = true;
                this.query = `${this.query.substring(0, index)}this.connection.
                ${this.query.substring(index, this.query.length)}`;
            }
        });
        if (!isAnyApiFound) {
            this.errMessage = "No valid api was found";
        }
        return this.query;
    }

    get allowedApi() {
        return [
            API.Select,
            API.Insert,
            API.Remove,
            API.Update,
            API.IsDbExist,
            API.Clear,
            API.Count,
            API.DropDb,
            API.BulkInsert,
            API.ExportJson
        ];
    }

    isQryValid() {
        const notAllowedKeywords = ["Instance", "then", "catch"];
        notAllowedKeywords.every((item) => {
            if (this.query.indexOf(item) >= 0) {
                this.errMessage = `keyword: '${item}' is not allowed, only write code for api call`;
                return false;
            }
            return true;
        });
        return !this.errMessage.length;
    }
} 