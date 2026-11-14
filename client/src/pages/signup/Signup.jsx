// src/pages/Signup.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userActions";
import { useTranslation } from "react-i18next";
import "./Signup.css";
const API_URL = process.env.REACT_APP_API_URL;

export default function Signup() {
  const { t } = useTranslation(); // ✅ الترجمة
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);

  // ✅ Validation schema مع الترجمة
  const SignupSchema = Yup.object().shape({
    businessName: Yup.string().required(t("signup.validation.businessName")),
    email: Yup.string()
      .email(t("validation.invalidEmail"))
      .required(t("validation.requiredEmail")),
    password: Yup.string()
      .min(6, t("signup.validation.shortPassword"))
      .matches(/\d/, t("signup.validation.numberRequired"))
      .required(t("signup.validation.requiredPassword")),
    confirm: Yup.string()
      .oneOf([Yup.ref("password")], t("signup.validation.passwordsMatch"))
      .required(t("signup.validation.confirmPassword")),
    business: Yup.string().required(t("signup.validation.business")),
  });

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, user]);

  const businessList = [
    { id: "shop", label: t("signup.businessOptions.shop") },
    { id: "restaurant", label: t("signup.businessOptions.restaurant") },
    { id: "hotel", label: t("signup.businessOptions.hotel") },
    { id: "activity", label: t("signup.businessOptions.activity") },
  ];

  const handleSignup = async (values, { setSubmitting, setFieldError }) => {
    try {
      const { confirm, ...payload } = values;
      const response = await axios.post(`${API_URL}/api/client/signup`, {
        name: payload.businessName,
        type: payload.business,
        email: payload.email,
        password: payload.password,
      });
      localStorage.setItem("token", response.data.token);
      dispatch(setUser(response.data.user));
      navigate("/additional-info", { replace: true });
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed";

      // ✅ إذا الخطأ متعلق بالإيميل (invalid or exists) → بيظهر تحت خانة الإيميل
      if (
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("client")
      ) {
        setFieldError(
          "email",
          msg.includes("exists")
            ? t("signup.errors.exists")
            : t("signup.errors.invalidEmail"),
        );
      } else {
        // باقي الأخطاء العامة
        setFieldError("businessName", t("signup.errors.general"));
      }

      console.error("Signup error: hello", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Left: illustration */}
        <div className="signup-image">
          <img src="/image/intro.png" alt={t("signup.alt")} />
        </div>

        {/* Right: Formik form */}
        <Formik
          initialValues={{
            businessName: "",
            email: "",
            password: "",
            confirm: "",
            business: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting }) => (
            <Form className="signup-form">
              <h2>{t("signup.title")}</h2>

              <label>{t("signup.businessName")}</label>
              <Field name="businessName" />
              <ErrorMessage
                name="businessName"
                component="p"
                className="error"
              />

              <label>{t("signup.email")}</label>
              <Field name="email" type="email" />
              <ErrorMessage name="email" component="p" className="error" />

              <label>{t("signup.password")}</label>
              <Field
                name="password"
                type="password"
                placeholder={t("signup.passwordPlaceholder")}
              />
              <ErrorMessage name="password" component="p" className="error" />

              <label>{t("signup.confirmPassword")}</label>
              <Field
                name="confirm"
                type="password"
                placeholder={t("signup.confirmPlaceholder")}
              />
              <ErrorMessage name="confirm" component="p" className="error" />

              <label className="business-label">{t("signup.business")}</label>
              <Field as="select" name="business">
                <option value="">{t("signup.selectBusiness")}</option>
                {businessList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="business" component="p" className="error" />

              <button
                type="submit"
                className="btn signup-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("signup.loading") : t("signup.button")}
              </button>

              <p className="signup-login-link">
                {t("signup.already")}{" "}
                <span onClick={() => navigate("/login")}>
                  {t("signup.login")}
                </span>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
