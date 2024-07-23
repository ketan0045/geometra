import { HEADLINES, ObjectsExportsOptions } from "../constants";
import { all, create } from "mathjs";

import AbstractExportDispatcher from "./AbstractExportDispatcher";
import AnnotationExportFactory from "./AnnotationExportFactory";
import AnnotationExportFieldsFactory from "./AnnotionExportFieldsFactory";
import Immutable from "immutable";
import _ from "lodash";

const config = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null,
};
const math = create(all, config);

export default class AnnotationExportDispatcher extends AbstractExportDispatcher {
    constructor() {
        super();
    }

    dispatch(exportType) {
        const exportFactory = new AnnotationExportFactory();
        const exportFieldsFactory = new AnnotationExportFieldsFactory();
        let headlineData = undefined;
        let data = new Immutable.List();
        let fields = new Immutable.List();
        switch (exportType) {
            case ObjectsExportsOptions.Folder_Export_Everything:
                try {
                    data = exportFactory.getFolderExport();
                    headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                    fields = exportFieldsFactory.getFolderFullExportFields(exportFactory.getPathLength());
                } catch (error) {
                    console.log("Error | Folder Export: " + error);
                }
                break;
            case ObjectsExportsOptions.Objects_Selection:
                data = exportFactory.getFlattenedAnnotationExportList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationFullExportFields(exportFactory.getPathLength());
                break;
            case ObjectsExportsOptions.Objects_Net_Selection:
                data = exportFactory.getFlattenedAnnotationExportList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationNetOnlyExportFields(exportFactory.getPathLength());
                break;
            case ObjectsExportsOptions.Objects_No_Folder_Net_Selection:
                data = exportFactory.getFlattenedAnnotationExportList();
                headlineData = this.getProjectExportHeadlineToClipboard(HEADLINES[exportType]);
                fields = exportFieldsFactory.getAnnotationNetOnlyNoPathExportFields();
                break;
            default:
                console.log("Export did not handle case for annotation: " + exportType);
        }
        data = this.applyTranslation(data);

        let dataWrapper = new Immutable.Map();
        dataWrapper = dataWrapper.set("fields", fields).set("data", data).set("headlineData", headlineData);
        return dataWrapper;
    }
}
