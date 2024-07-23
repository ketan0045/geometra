import { AnnotationStore, ScaleStore } from "stores";
import { Dropdown, Input, Menu, Row, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { X_SCALE_NAME, Y_SCALE_NAME } from "../../../../constants";
import { getScaleColorValue, getScaleInputWidth } from "../../Calculate.utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { areAnnotsLocked } from "../CalculateProperties/CalculateProperties.utils";
import { useTranslation } from "react-i18next";

const ScaleInput = ({ onIconClick, scaleName, length, icon, onScaleDelete, hideDeleteOption = false, activePage, scaleType, value }) => {
    const { t } = useTranslation();
    const scaleProperties = ScaleStore.getScale(scaleType, activePage);

    const menu = (
        <Menu>
            {!hideDeleteOption && !areAnnotsLocked(scaleProperties ? [scaleProperties] : scaleProperties) && (
                <Menu.Item key="delete" onClick={onScaleDelete}>
                    {t("GENERAL.DELETE")}
                </Menu.Item>
            )}
        </Menu>
    );
    return (
        <Dropdown overlay={menu} trigger={["contextMenu"]} className="Calculate_ScaleContainer">
            <Tooltip
                placement="bottom"
                title={
                    <span>
                        {t("GENERAL.TOOLTIP.SCALE_1")}
                        <br />- {t("GENERAL.TOOLTIP.SCALE_2")}
                        <br />- {t("GENERAL.TOOLTIP.SCALE_3")}
                        <br />
                        <br />
                        <Tag>Ctrl + 0</Tag>
                    </span>
                }
            >
                <Row justify="center" align="middle" className="Calculate_Wrapper_Toolbar_Scale_Icon" onClick={onIconClick}>
                    <FontAwesomeIcon icon={icon} style={{ color: getScaleColorValue(scaleName, activePage) }} />
                </Row>
                <Input
                    type="number"
                    readOnly={true}
                    value={value}
                    suffix={<div onClick={onIconClick}>m</div>}
                    className="Calculate_Wrapper_Toolbar_Scale_Input"
                    style={{ width: getScaleInputWidth(length) }}
                    onClick={onIconClick}
                />
            </Tooltip>
        </Dropdown>
    );
};

export default ScaleInput;
