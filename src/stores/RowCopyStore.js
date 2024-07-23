import { createStore } from "reflux";
import Immutable from "immutable";
import AnnotationStore from "./AnnotationStore";
import CalculationStore from "./CalculationStore";
import CalculateActions from "../actions/CalculationActions";
import _, { map, uniqBy } from "lodash";
import { ANNOT_TYPES } from "constants/AnnotationConstants";
import ObjectsStore from "./ObjectsStore";

export default createStore({
    init() {
        this.copiedRows = [];
    },

    getCopyAnnotationRows() {
        return this.copiedRows;
    },

    copySelectedRows(selectedRows) {
        this.copiedRows = selectedRows;
    },

    copyAnnotationRows(selectedAnnotations) {
        this.copiedRows = [];
        _.forEach(selectedAnnotations, (annot) => {
            const rows = _.values(annot.rows);
            this.copiedRows = _.concat(this.copiedRows, rows);
        });
    },

    pasteAnnotationRows(selectedAnnotations) {
        const annotsToPasteRows = _.filter(selectedAnnotations, (annot) => annot.type !== ANNOT_TYPES.GROUP);

        if (this.copiedRows.length) {
            const annotsToPasteRowsIds = _.map(annotsToPasteRows, (annot) => annot.id);
            const rowsToPasteIds = this.copiedRows.map((row) => row.id);
            if (annotsToPasteRowsIds.length > 0) CalculationStore.onRequestPasteRows(annotsToPasteRowsIds, rowsToPasteIds);
        }
    },

    replaceSelectedRows(selectedAnnotations, selectedRows) {
        if (this.copiedRows.length) {
            const rowsToInsert = [];
            const annotIds = _.map(
                _.filter(selectedAnnotations, (annot) => annot.type !== ANNOT_TYPES.GROUP),
                (annot) => annot.id
            );
            _.forEach(annotIds, (annotId) => {
                this.copiedRows.forEach((row) => {
                    row.geoAnnotation = { id: annotId };
                    rowsToInsert.push(row);
                });
            });

            if (rowsToInsert.length > 0) {
                CalculationStore.onRequestDeleteSelectedRows(selectedRows);
                CalculateActions.requestCreateRow({ annotationIds: annotIds, newRows: rowsToInsert });
            }
        }
    },

    replaceAnnotationRows(selectedAnnotations) {
        if (this.copiedRows?.length) {
            const rowsToInsert = [];
            const annotIds = _.map(
                _.filter(selectedAnnotations, (annot) => annot.type !== ANNOT_TYPES.GROUP),
                (annot) => annot.id
            );
            _.forEach(annotIds, (annotId) => {
                this.copiedRows.forEach((row) => {
                    row.geoAnnotation = { id: annotId };
                    rowsToInsert.push(row);
                });
            });
            if (rowsToInsert.length > 0) {
                CalculateActions.requestDeleteRow(selectedAnnotations);
                CalculateActions.requestCreateRow({ annotationIds: annotIds, newRows: rowsToInsert });
            }
        }
    },

    getAllAnnotationRows(selectedAnnotations) {
        let rowsArray = [];

        const annotations = this.getAnnotationsToUpdate(selectedAnnotations, true);
        const rows = ObjectsStore.getSeparateBundledRows();
        annotations.forEach(() => {
            rows.forEach((row) => rowsArray.push(row));
        });

        return rowsArray;
    },

    getAnnotationsToUpdate(selectedAnnotations, withoutDuplicates = false) {
        let annotationsToUpdate = new Immutable.List();
        selectedAnnotations &&
            selectedAnnotations.forEach((annot) => {
                if (annot.type === "group") {
                    const children = AnnotationStore.getAllAnnotationsFromParent(annot.id).filter((_annot) => {
                        return _annot.type !== "group";
                    });
                    annotationsToUpdate = annotationsToUpdate.concat(children);
                } else {
                    annotationsToUpdate = annotationsToUpdate.push(annot);
                }
            });
        if (withoutDuplicates) return uniqBy(annotationsToUpdate.toJS(), "id");
        return annotationsToUpdate;
    },
});
