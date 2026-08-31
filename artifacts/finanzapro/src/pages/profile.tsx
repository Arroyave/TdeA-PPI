import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  type: z.enum(["personal", "business"]),
  currency: z.string().min(3, "El código de moneda es obligatorio"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
});

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "personal",
      currency: "COP",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        type: profile.type,
        currency: profile.currency,
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateProfile.mutate(
      { data: { ...values, email: values.email || null } },
      {
        onSuccess: () => {
          toast({ title: "Perfil actualizado correctamente" });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        },
        onError: () => {
          toast({ title: "Error al actualizar el perfil", variant: "destructive" });
        }
      }
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de perfil</h1>
          <p className="text-muted-foreground mt-1">Administra tus preferencias de cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Actualiza tus datos personales y configuración de cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Cargando perfil...</div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="juan@ejemplo.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de cuenta</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="personal">Personal</SelectItem>
                              <SelectItem value="business">Empresa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="COP">COP ($) - Peso colombiano</SelectItem>
                              <SelectItem value="USD">USD ($) - Dólar americano</SelectItem>
                              <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                              <SelectItem value="GBP">GBP (£) - Libra esterlina</SelectItem>
                              <SelectItem value="MXN">MXN ($) - Peso mexicano</SelectItem>
                              <SelectItem value="ARS">ARS ($) - Peso argentino</SelectItem>
                              <SelectItem value="BRL">BRL (R$) - Real brasileño</SelectItem>
                              <SelectItem value="CAD">CAD (C$) - Dólar canadiense</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
