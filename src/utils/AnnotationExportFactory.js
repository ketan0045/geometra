import i18n from "./../i18nextInitialized";
import { ANNOTS, ANNOT_TYPES } from "../constants";
import { TreeStoreV2, ObjectsStore } from "stores";
import _ from "lodash";

export default class AnnotationExportFactory {
    constructor() {
        this.pathLength = -1;
    }

    initFolderData(dataList) {
        return dataList.map((dataObject) => {
            if (dataObject[ANNOTS.FOLDER]) {
                let pathList = dataObject[ANNOTS.FOLDER].split(">");
                let length = 0;
                if (pathList.length === 2 && pathList[0] === "" && pathList[1] === "") {
                    pathList = [""];
                    length = 1;
                } else length = pathList.length;
                pathList.forEach((path, index) => (dataObject[i18n.t(ANNOTS.GROUP_FOLDER) + " " + (index + 1)] = `${path.trim()} >`));
                if (this.pathLength < length) this.pathLength = length;
            }
            return dataObject;
        });
    }

    getPathLength() {
        return this.pathLength;
    }

    getFolderExport() {
        const calcAnnotsToReturn = [];
        let index = 0;
        try {
            _.forEach(TreeStoreV2.getFolderMapping(), (folderMap) => {
                if (folderMap.data.type === ANNOT_TYPES.GROUP) {
                    let currentLevelAnnotsData = [];
                    const firstChildren = folderMap.parentChildrens[0];
                    if (firstChildren) {
                        const currentPath = ObjectsStore.getFoldersPathForExport(firstChildren.data);

                        _.forEach(folderMap.parentChildrens, (parentChildren) => {
                            if (parentChildren.data.type !== ANNOT_TYPES.GROUP) {
                                const currentAnnotData = JSON.parse(JSON.stringify(parentChildren.data.annotationData));

                                if (currentAnnotData["ESTIMATE.ANNOTATION_VALUES.AREA"]) {
                                    _.set(currentAnnotData, [ANNOTS.AREA], currentAnnotData["ESTIMATE.ANNOTATION_VALUES.AREA"]);
                                    delete currentAnnotData["ESTIMATE.ANNOTATION_VALUES.AREA"];
                                }
                                if (currentAnnotData["ESTIMATE.ANNOTATION_VALUES.LENGTH"]) {
                                    _.set(currentAnnotData, [ANNOTS.LENGTH], currentAnnotData["ESTIMATE.ANNOTATION_VALUES.LENGTH"]);
                                    delete currentAnnotData["ESTIMATE.ANNOTATION_VALUES.LENGTH"];
                                }
                                if (currentAnnotData["ESTIMATE.ANNOTATION_VALUES.VOLUME"]) {
                                    _.set(currentAnnotData, [ANNOTS.VOLUME], currentAnnotData["ESTIMATE.ANNOTATION_VALUES.VOLUME"]);
                                    delete currentAnnotData["ESTIMATE.ANNOTATION_VALUES.VOLUME"];
                                }
                                if (currentAnnotData["ESTIMATE.ANNOTATION_VALUES.WALL"]) {
                                    _.set(currentAnnotData, [ANNOTS.WALL], currentAnnotData["ESTIMATE.ANNOTATION_VALUES.WALL"]);
                                    delete currentAnnotData["ESTIMATE.ANNOTATION_VALUES.WALL"];
                                }
                                if (currentAnnotData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"]) {
                                    _.set(currentAnnotData, [ANNOTS.COUNT], currentAnnotData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"]);
                                    delete currentAnnotData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"];
                                }

                                currentLevelAnnotsData = _.concat(currentLevelAnnotsData, currentAnnotData);
                            }
                        });

                        const sumAnnotsData = ObjectsStore.minfiedSummation(currentLevelAnnotsData);
                        _.set(sumAnnotsData, [ANNOTS.ID], ++index);
                        _.set(sumAnnotsData, [ANNOTS.FOLDER], currentPath);
                        calcAnnotsToReturn.push(sumAnnotsData);
                    }
                }
            });

            return this.initFolderData(calcAnnotsToReturn);
        } catch (error) {
            console.log("Error | getFolderCalculationExportList: " + error);
            return [];
        }
    }

    getFlattenedAnnotationExportList() {
        let index = 0;
        const { selectionList } = ObjectsStore.getSelectionList(true);
        const parsed = selectionList.map((annotation) => {
            const currentPath = ObjectsStore.getFoldersPathForExport(annotation);
            let currentAnnot = JSON.parse(JSON.stringify(annotation));
            if (currentAnnot.geoEstimate) delete currentAnnot.geoEstimate;
            _.set(currentAnnot, [ANNOTS.ID], ++index);
            _.set(currentAnnot, [ANNOTS.FOLDER], currentPath);
            if (currentAnnot.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"]) {
                _.set(currentAnnot, [ANNOTS.COUNT], currentAnnot.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"]);
                delete currentAnnot.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.COUNT"];
            }
            if (currentAnnot.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"]) delete currentAnnot.annotationData["ESTIMATE.ANNOTATION_VALUES.LENGTHS"];

            currentAnnot = this.initAnnotationForExport(currentAnnot);
            return currentAnnot;
        });
        return this.initFolderData(parsed);
    }

    initAnnotationForExport(annotation) {
        const { type } = annotation;
        annotation = { ...annotation.annotationData, ...annotation };
        switch (type) {
            case "Ellipse":
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Circle"));
                break;
            case "annotation.freeHand":
            case "Free hand":
            case "Free Hand":
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Free Hand"));
                break;
            case "Reduction":
                const parent = TreeStoreV2.getFolderMapping()[annotation.parentId];
                _.set(annotation, ["ESTIMATE.ANNOTATION_PROPERTIES.REDUCTION_OF"], `(${parent?.data?.number}) ${parent?.data?.name}`);
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Reduction"));
                break;
            case "Polygon":
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Area"));
                break;
            case "Polyline":
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Line"));
                break;
            case "Point":
                _.set(annotation, [ANNOTS.TYPE], i18n.t("Point"));
                if (annotation.height) delete annotation.height;
                break;
            default:
                break;
        }
        _.set(annotation, [ANNOTS.FILE_NAME], annotation.annotationData["ESTIMATE.ANNOTATION_PROPERTIES.FILE_NAME"]);

        return annotation;
    }
}
