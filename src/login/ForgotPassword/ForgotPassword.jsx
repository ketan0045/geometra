import "./forgotpassword.less";

import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";

import { AuthenticationStore } from "stores";
import { Button } from "antd";
import { LoginWrapper } from "../../components";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const { t } = useTranslation();
    const { push } = useHistory();
    const { eMail, action } = useParams();
    const encodedMail = Buffer.from(eMail, "base64").toString("ascii").toLowerCase();

    useEffect(() => {
        if (action === "forgotPassword" || action === "changePassword")
            axios.post(`${process.env.REACT_APP_NODE_URL}/reset_password`, { eMail: encodedMail, url: window.location.origin });
    }, []);

    const getCardLabel = () => {
        switch (action) {
            case "forgotPassword":
                return t("GENERAL.FORGOT_PASSWORD");
            case "changePassword":
                return t("GENERAL.CHANGE_PASSWORD");
            default:
                setTimeout(() => push("/login"), 250);
                break;
        }
    };
    return AuthenticationStore.isCompleteLoggedIn() && action === "forgotPassword" ? (
        <Redirect to="/projects" />
    ) : !AuthenticationStore.isCompleteLoggedIn() && action === "changePassword" ? (
        <Redirect to="/login" />
    ) : (
        <LoginWrapper cardTitle={getCardLabel()}>
            <div className="Forgot_Password_Content">{t("GENERAL.PASSWORD_RESET_INSTRUCTIONS")}</div>

            <Button className="LoginWrapper_Card_Button" type="primary" onClick={() => push("/login")}>
                {action === "changePassword" ? t("GENERAL.BACK_TO_PROJECT") : t("GENERAL.BACK_TO_LOGIN")}
            </Button>
        </LoginWrapper>
    );
};

export default ForgotPassword;
