"use client"

import { Controller } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Truck } from "lucide-react"
import { useState } from "react"

import { SignInForm, SignInFormType } from "@/lib/zodTypes/loginZodForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/authContext"

export default function Login() {
  const { login, user, isAuthenticated, status } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const form = SignInForm()

  async function onSubmit({ email, password }: SignInFormType) {
    setSubmitting(true)

    try {

      await login(email, password)

      toast.success("Login realizado com sucesso!")



    } catch {
      toast.error("Não foi possível autenticar. Verifique suas credenciais.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-muted/30 p-4 sm:p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Truck className="size-6" />
        </div>
        <h1 className="font-heading text-xl font-semibold">Delivery</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar na sua conta</CardTitle>
          <CardDescription>
            Digite seu email e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="voce@empresa.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-password">Senha</FieldLabel>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="submit"
                form="login-form"
                className="w-full"
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Entrar
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
