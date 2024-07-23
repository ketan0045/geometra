import { Button, Form, Input } from "antd";
import React, { useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";

import { LoginWrapper } from "../../components";
import axios from "axios";
import { passwordRegex } from "../../utils/Validator";
import { useTranslation } from "react-i18next";
import { AuthenticationStore, ProjectsStore } from "stores";

const NewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const formRef = useRef();
    const { t } = useTranslation();
    const { push } = useHistory();
    const { token, eMail } = useParams();

    const onChangePassword = () => {
        axios
            .post(`${process.env.REACT_APP_NODE_URL}/set_password`, {
                token,
                eMail,
                newPassword: password,
                confirmedNewPassword: confirmPassword,
            })
            .then((res) => {
                setError("");
                ProjectsStore.clearProjects();
                AuthenticationStore.onLogout();
                push("/");
            })
            .catch(function (error) {
                if (error.response) {
                    setError(error.response.data.message);
                    formRef.current.validateFields();
                }
            });
    };

    return (
        <LoginWrapper cardTitle={t("GENERAL.NEW_PASSWORD")}>
            <Form onFinish={onChangePassword} name="password-form" ref={formRef}>
                <label htmlFor="password" className="Login_Container_Label">
                    {t("GENERAL.NEW_PASSWORD")}
                </label>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            pattern: passwordRegex,
                            message: t("GENERAL.PASSWORD_INSTRUCTION"),
                        },
                        {
                            required: true,
                            message: t("GENERAL.ENTER_NEW_PASSWORD"),
                        },
                    ]}
                    validateTrigger="onBlur"
                >
                    <Input.Password className="Input" value={password} onChange={(e) => setPassword(e.target.value)} name="password" />
                </Form.Item>
                <label htmlFor="password" className="Login_Container_Label">
                    {t("GENERAL.CONFIRM_PASSWORD")}
                </label>
                <Form.Item
                    name="confirmPassword"
                    rules={[
                        {
                            required: true,
                            message: t("GENERAL.ENTER_CONFIRM_PASSWORD"),
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (value && getFieldValue("password") !== value) return Promise.reject(new Error(t("GENERAL.PASSWORDS_DO_NOT_MATCH")));
                                if (error) return Promise.reject(new Error(t("GENERAL.PASSWORD_LINK_EXPIRED")));
                                return Promise.resolve();
                            },
                        }),
                    ]}
                    validateTrigger="onBlur"
                >
                    <Input.Password className="Input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} name="confirmPassword" />
                </Form.Item>
                <Form.Item>
                    <Button className="LoginWrapper_Card_Button" type="primary" htmlType="submit">
                        {t("GENERAL.SET_NEW_PASSWORD")}
                    </Button>
                </Form.Item>
            </Form>
        </LoginWrapper>
    );
};

export default NewPassword;
