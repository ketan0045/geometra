import i18n from "./../i18nextInitialized";
import { all, create } from "mathjs";
import ProjectsStore from "./../stores/ProjectsStore";
import DepartmentStore from "./../stores/DepartmentStore";
import Immutable from "immutable";
import json2csv from "json2csv";
import { ANNOTS } from "../constants";
import { CalculationStore, EstimateStore } from "stores";
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

export default class AbstractExportDispatcher {
    constructor() {}

    /**
     * Abstract method
     */
    dispatch(exportType) {
        throw new Error("Method not overriden yet!");
    }

    applyTranslation(data) {
        return _.map(data, (obj) => {
            const currentObj = {};
            _.forOwn(obj, (value, key) => {
                let tmpVal = key;
                let newValue;

                switch (key) {
                    case "name":
                        tmpVal = ANNOTS.NAME;
                        break;
                    case "number":
                        tmpVal = ANNOTS.NUMBER;
                        break;
                    case "type":
                        tmpVal = ANNOTS.TYPE;
                        break;
                    default:
                        tmpVal = tmpVal.replace("ANNOTATION_VALUES.", "");
                        tmpVal = tmpVal.replace("ANNOTATION_PROPERTIES.", "");
                        tmpVal = tmpVal.replace("RED_", "REDUCTION_");
                        break;
                }

                if (ProjectsStore.getProjectUnitsByID() === "imperial") {
                    switch (key) {
                        case "area":
                        case "totalReduction":
                        case "netArea":
                        case "wall":
                            newValue = CalculationStore.formatAmountValue(math.unit(value, "m2").to("sqft").toNumeric(), false);
                            break;
                        case "volume":
                            newValue = CalculationStore.formatAmountValue(math.unit(value, "m3").to("cuft").toNumeric(), false);
                            break;
                        case "totalLength":
                        case "radiusX":
                        case "radiusY":
                        case "diameterX":
                        case "diameterY":
                        case "circumference":
                        case "height":
                            newValue = CalculationStore.formatNumberValue(math.unit(value, "m").to("ft").toNumeric(), false);
                            break;
                        default:
                            newValue = typeof value === "number" ? CalculationStore.formatAmountValue(value, false) : value;
                            break;
                    }
                } else {
                    switch (key) {
                        case "ID":
                        case "id":
                        case ANNOTS.ID:
                        case ANNOTS.COUNT:
                        case "pages":
                        case "pageNumber":
                        case "strokeSize":
                        case "fontSize":
                        case "geometraBorderOpacity":
                        case "geometraOpacity":
                        case "quantity":
                        case "rotation":
                        case "pointSize":
                        case "ESTIMATE.ANNOTATION_VALUES.POINTS":
                        case "ESTIMATE.ANNOTATION_PROPERTIES.COUNT":
                            newValue = value;
                            break;
                        case "height":
                        case "ESTIMATE.ANNOTATION_PROPERTIES.HEIGHT":
                            newValue = CalculationStore.formatNumberValue(value, false);
                            break;
                        default:
                            newValue = typeof value === "number" ? CalculationStore.formatAmountValue(value, false) : value;
                            break;
                    }
                }
                _.set(currentObj, [i18n.t(tmpVal)], newValue);
            });
            return currentObj;
        });
    }

    getProjectExportHeadlineToClipboard(exportName) {
        let headline = "";
        let projectLeaderName = "";
        let dateString = "";
        const activeProject = ProjectsStore.getProjectById(ProjectsStore.getActiveProjectId());
        if (activeProject) {
            const projectLeader = DepartmentStore.getDepartmentUserById(activeProject.get("projectLeaderId"));
            if (projectLeader) {
                projectLeaderName = projectLeader.get("firstName") + " " + projectLeader.get("lastName");
            }
            const date = new Date();
            const formattedDate = new Intl.DateTimeFormat(i18n.language, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(date);
            dateString = formattedDate.toString();
            headline =
                "Geometra " +
                i18n.t("Export") +
                " - (" +
                activeProject.get("projectNumber") +
                ") " +
                activeProject.get("name") +
                " - " +
                EstimateStore.getActiveEstimate().name +
                " - " +
                i18n.t(exportName) +
                " - [" +
                projectLeaderName +
                " - " +
                dateString +
                "]";
        }

        let returnValue = new Immutable.Map();
        return returnValue
            .set(
                "exportData",
                json2csv({
                    fields: [
                        {
                            label: "",
                            value: headline,
                            default: "",
                            stringify: false,
                        },
                    ],
                    del: "\t",
                })
            )
            .set("filename", headline);
    }
}
