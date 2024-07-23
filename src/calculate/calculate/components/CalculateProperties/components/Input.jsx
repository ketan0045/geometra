import { Input as AntInput } from "antd";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { ANNOT_TYPES } from "constants/AnnotationConstants";
import { AnnotationStore, ObjectsStore } from "stores";

const NUMBER_REGEX = /[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)/;

const Input = ({ label, obj, value, onUpdate, numbersOnly = false, percents = false, textAlign = "inherit", containerClass = false, style, ...rest }) => {
    const { t } = useTranslation();
    const [currentValue, setCurrentValue] = useState(value);
    const ref = useRef(null);
    const refDefaultValue = useRef(null);

    useEffect(() => {
        setCurrentValue(value);
        refDefaultValue.current = value;
    }, [value]);

    useEffect(() => {
        return () => onAccept();
    }, []);

    useEffect(() => {
        function unsubscribeAnnotationStore() {
            AnnotationStore.listen(annotationStoreUpdated);
        }
        unsubscribeAnnotationStore();
        return () => unsubscribeAnnotationStore();
    }, []);

    const annotationStoreUpdated = (message) => {
        switch (message) {
            case "folderInserted":
                if (obj === "name" && ref.current) {
                    ref.current.focus();
                    ref.current.select();
                }
                break;
            case "focusNameInput":
            case "scaleInserted":
                if (obj === "length" && ref.current) {
                    ref.current.focus();
                    ref.current.select();
                }
                break;
            case "annotationsInserted":
                const typeMap = ObjectsStore.getTypeMap();
                if (obj === "name" && typeMap[ANNOT_TYPES.FREE_TEXT] === 0 && ref.current) {
                    ref.current.focus();
                    ref.current.select();
                }
                break;
            case "focusNrTagInput":
                if (obj === "number" && ref.current) {
                    ref.current.focus();
                    ref.current.select();
                }
                break;
            default:
                break;
        }
    };

    const onAccept = () => {
        const newValue = ref.current.state?.value;
        const initialValue = refDefaultValue.current;
        if (newValue !== initialValue) {
            if (numbersOnly) {
                if (NUMBER_REGEX.test(newValue)) {
                    if (percents && newValue >= 1 && newValue <= 100) onUpdate(newValue / 100, obj);
                    else if (!percents) onUpdate(+newValue, obj);
                }
            } else onUpdate(newValue, obj);
        }
        ref.current.blur();
    };

    const onChange = (e) => {
        setCurrentValue(e.target.value);
    };

    return (
        <div className={`properties-pane-item${containerClass ? ` ${containerClass}` : ""}`} style={{ ...style }}>
            <label>{t(label)}</label>
            <AntInput
                ref={ref}
                value={currentValue}
                onChange={onChange}
                onPressEnter={onAccept}
                onBlur={onAccept}
                bordered={Boolean(obj === "length") || Boolean(obj === "name")}
                style={{ textAlign }}
                {...rest}
            />
        </div>
    );
};

export default Input;
