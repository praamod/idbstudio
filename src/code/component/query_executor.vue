<template>
  <div id="divQueryExecutor">
    <div id="divButtonContainer">
      <b-button-group>
        <b-button variant="primary" @click="createNewTab">
          New Query
          <i class="fas fa-plus-circle"></i>
        </b-button>
        <b-button variant="primary" @click="open">
          Open
          <i class="fas fa-folder-open"></i>
        </b-button>
        <b-button variant="primary" @click="save">
          Save
          <i class="fas fa-save"></i>
        </b-button>
      </b-button-group>
      <input type="file" id="inputFileOpener" class="hide" accept='.js' @change="onFileOpened"/>
      <b-button-group class="float-right">
        <b-button variant="success" @click="executeQry">
            Execute
            <i class="fas fa-play"></i>
        </b-button>
        <b-button variant="success" @click="getLink">
            Get Link
            <i class="fas fa-link"></i>
        </b-button>
      </b-button-group>
    </div>
    <b-card no-body id="divEditorContainer">
      <b-tabs card>
        <b-tab active v-for="(item) in $data.tabCount" :key="'tab'+item" v-bind:title="'Query '+item">
          <Editor v-bind:id="'editor' + item"></Editor>
        </b-tab>
      </b-tabs>
    </b-card>
    <QueryResult></QueryResult>
    <transition name="fade">
      <div id="divResultInfo" v-if="showResultInfo">
        <table>
          <tr>
            <td>
              <b>No of Record :</b>
              <span>{{resultCount}}</span>
              <b class="seperator">|</b>
              <b>Time Taken :</b>
              <span>{{timeTaken}} sec.</span>
            </td>
            <td>
              <i @click="showResultInfo=false" class="fas fa-times"></i>
            </td>
          </tr>
        </table>
      </div>
    </transition>
    <component v-bind:is="currentModalComponent"></component>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { vueEvent } from "../common_var";
import Editor from "./editor.vue";
import QueryResult from "./qry_result.vue";
import { MainService } from "../service/main_service";
import { QueryHelper } from "../helpers/query_helper";
import { IResult } from "../interfaces/result";
import { DomHelper } from "../helpers/dom_helper";
import { Util } from "../util";
import { DATA_TYPE } from "jsstore";
import QueryLink from "./query_link.vue";

@Component({
  components: {
    QueryLink,
    Editor,
    QueryResult
  }
})
export default class QueryExecutor extends Vue {
  currentModalComponent = "";
  tabCount = 0;
  timeTaken = "";
  resultCount: number | string = "";
  showResultInfo = false;
  editorContainerHeight;
  resultContainerHeight;
  isResultVisible = false;
  isQueryExecuting = false;
  isSaveBtnClicked = false;

  constructor() {
    super();
    this.catchEvents();
  }

  mounted() {
    const $ = new DomHelper();
    const menuHeight = 50;
    const buttonHeight = ($.qry("#divButtonContainer") as HTMLElement)
      .clientHeight;
    const margin = 10;
    const editorHeight =
      (window.innerHeight - (menuHeight + buttonHeight + margin)) / 2;
    this.editorContainerHeight = editorHeight + buttonHeight;
    this.resultContainerHeight = editorHeight - buttonHeight - 10;
    ($.qry("#divEditorContainer") as HTMLElement).style.height =
      this.getEditorContainerHeight() + "px";
    ($.qry("#divResult") as HTMLElement).style.height =
      this.resultContainerHeight + "px";
  }

  onFileOpened(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
      var text = reader.result;
      vueEvent.$emit("set_qry", text);
    };
    reader.readAsText(input.files[0]);
    event.target.value = null;
  }

  open() {
    var $ = new DomHelper();
    $.getById("inputFileOpener").click();
  }

  fireGetQry() {
    vueEvent.$emit("get_qry");
  }

  getEditorContainerHeight() {
    return this.isResultVisible
      ? this.editorContainerHeight
      : this.editorContainerHeight + this.resultContainerHeight;
  }

  createNewTab() {
    ++this.tabCount;
  }

  save() {
    this.isQueryExecuting = false;
    this.isSaveBtnClicked = true;
    this.fireGetQry();
  }

  saveQuery(qry) {
    const stringValue = "query_save_count";
    var count = Number(localStorage.getItem(stringValue));
    ++count;
    localStorage.setItem(stringValue, count.toString());
    var fileName = prompt("FileName", "idbstudio_qry_" + count);
    if (fileName != null) {
      const url = URL.createObjectURL(new Blob([qry], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName + ".js";
      link.click();
    }
  }

  executeQry() {
    this.isQueryExecuting = true;
    this.isResultVisible = true;
    this.fireGetQry();
    const $ = new DomHelper();
    ($.qry("#divEditorContainer") as HTMLElement).style.height =
      this.getEditorContainerHeight() + "px";
    var resultContainer = $.qry("#divResult") as HTMLElement;
    resultContainer.style.height = this.resultContainerHeight + "px";
    resultContainer.classList.remove("hide");
    vueEvent.$emit("set_editor_height", this.editorHeight);
  }

  evaluateAndShowResult(qry: string) {
    var queryHelperInstance = new QueryHelper(qry);
    if (queryHelperInstance.isQryValid()) {
      const query = queryHelperInstance.getQuery();
      if (queryHelperInstance.errMessage.length == 0) {
        new MainService()
          .executeQry(query)
          .then(qryResult => {
            this.showResultInfo = true;
            this.resultCount =
              Util.getType(qryResult.result) === DATA_TYPE.Array
                ? qryResult.result.length
                : 0;
            this.timeTaken = qryResult.timeTaken.toString();
            vueEvent.$emit("on_qry_result", qryResult.result);
          })
          .catch(function(err) {
            vueEvent.$emit("on_qry_error", err);
          });
      } else {
        vueEvent.$emit("on_error", queryHelperInstance.errMessage);
      }
    } else {
      vueEvent.$emit("on_error", queryHelperInstance.errMessage);
    }
  }

  takeQuery(qry: string) {
    if (this.isQueryExecuting) {
      this.evaluateAndShowResult(qry);
    } else if (this.isSaveBtnClicked) {
      this.saveQuery(qry);
    } else {
      this.showLinkModal(qry);
    }
  }

  get editorHeight() {
    return this.getEditorContainerHeight() - 90;
  }

  catchEvents() {
    vueEvent
      .$on("db_info_loaded", this.createNewTab)
      .$on("take_qry", this.takeQuery)
      .$on("get_editor_height", () => {
        vueEvent.$emit("set_editor_height", this.editorHeight);
      })
      .$on("run_qry", this.executeQry);
  }

  showLinkModal(qry: string) {
    qry = encodeURIComponent(qry);
    setTimeout(() => {
      vueEvent.$emit("show_get_link_modal", qry);
    }, 200);
  }

  getLink() {
    this.currentModalComponent = "QueryLink";
    this.isQueryExecuting = false;
    this.isSaveBtnClicked = false;
    this.fireGetQry();
  }
}
</script>
<style lang="scss" scoped>
#divQueryExecutor {
  margin-top: 10px;
  background-color: rgb(241, 241, 241);
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
}
#divResultInfo {
  height: 50px;
  position: absolute;
  bottom: 0px;
  background: inherit;
  z-index: 100;
  width: 97%;
}
table {
  height: inherit;
  width: 100%;
}
table tr td {
  padding-left: 20px;
}
table tr td:last-child {
  text-align: right;
  padding-right: 20px;
  padding-left: 50px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
  bottom: 0px;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  bottom: -100px;
}
</style>


