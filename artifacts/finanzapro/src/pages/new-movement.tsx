import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateMovement, useListCategories, getListMovementsQueryKey, getGetDashboardSummaryQueryKey, getGetRecentMovementsQueryKey, getGetMonthlyTrendQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es obligatoria"),
  date: z.string().min(1, "La fecha es obligatoria"),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewMovement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  const createMovement = useCreateMovement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: "" as any,
      description: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "none",
      notes: "",
    },
  });

  const type = form.watch("type");
  const filteredCategories = categories?.filter(c => c.type === "both" || c.type === type) || [];

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMovement.mutate(
      {
        data: {
          type: values.type,
          amount: values.amount,
          description: values.description,
          date: values.date,
          categoryId: values.categoryId && values.categoryId !== "none" ? Number(values.categoryId) : null,
          notes: values.notes || null,
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Movimiento creado correctamente" });
          queryClient.invalidateQueries({ queryKey: getListMovementsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentMovementsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
          setLocation("/movements");
        },
        onError: () => {
          toast({ title: "Error al crear el movimiento", variant: "destructive" });
        }
      }
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Movimiento</h1>
          <p className="text-muted-foreground mt-1">Registra un ingreso o gasto</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la transacción</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Ingreso</SelectItem>
                            <SelectItem value="expense">Gasto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Compra supermercado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sin categoría</SelectItem>
                            {filteredCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalles adicionales sobre esta transacción..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setLocation("/movements")}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMovement.isPending}>
                    {createMovement.isPending ? "Guardando..." : "Guardar movimiento"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
