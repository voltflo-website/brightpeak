"use client";

import { useState, FormEvent } from "react";

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  half?: boolean;
}

interface ServiceOption {
  value: string;
  label: string;
}

interface ContactFormProps {
  title: string;
  fields: FormField[];
  serviceSelect: {
    label: string;
    placeholder: string;
    options: ServiceOption[];
  };
  messageField: {
    label: string;
    placeholder: string;
  };
  submitButton: string;
}

export default function ContactForm({ title, fields, serviceSelect, messageField, submitButton }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        const json = await res.json();
        setErrorMsg(json.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Failed to send. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <h2 className="text-3xl font-extrabold mb-8">{title}</h2>
        <div
          className="p-8 rounded-2xl text-center"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="text-4xl mb-4">✓</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>Thank You!</h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="btn btn-primary"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-8">{title}</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          {fields.filter((f) => f.half).map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold mb-2">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus-ring-brand"
                style={{ borderColor: "var(--gray-300)", background: "var(--bg-primary)" }}
                placeholder={field.placeholder}
                required={field.name === "firstName" || field.name === "email"}
              />
            </div>
          ))}
        </div>
        {fields.filter((f) => !f.half).map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold mb-2">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus-ring-brand"
              style={{ borderColor: "var(--gray-300)", background: "var(--bg-primary)" }}
              placeholder={field.placeholder}
              required={field.name === "email"}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-semibold mb-2">{serviceSelect.label}</label>
          <select
            name="service"
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus-ring-brand"
            style={{ borderColor: "var(--gray-300)", background: "var(--bg-primary)" }}
          >
            <option value="">{serviceSelect.placeholder}</option>
            {serviceSelect.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">{messageField.label}</label>
          <textarea
            name="message"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus-ring-brand"
            style={{ borderColor: "var(--gray-300)", background: "var(--bg-primary)" }}
            placeholder={messageField.placeholder}
            required
          ></textarea>
        </div>
        {status === "error" && (
          <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full py-3 rounded-lg text-white font-bold text-lg"
          style={{ background: status === "sending" ? "#999" : "var(--teal)", cursor: status === "sending" ? "not-allowed" : "pointer" }}
        >
          {status === "sending" ? "Sending..." : submitButton}
        </button>
      </form>
    </div>
  );
}
