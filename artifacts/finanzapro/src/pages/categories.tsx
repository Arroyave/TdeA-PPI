import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListCategories, useCreateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, PlusIcon } from "lucide-react";

const tipoLabel: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
  both: "Ambos",
};

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  type: z.enum(["income", "expense", "both"]),
  color: z.string().min(1, "El color es obligatorio"),
});

export default function Categories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: "#3b82f6",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCategory.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "Categoría creada correctamente" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsCreateOpen(false);
          form.reset();
        },
        onError: () => {
          toast({ title: "Error al crear la categoría", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      deleteCategory.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Categoría eliminada correctamente" });
            queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          },
          onError: () => {
            toast({ title: "Error al eliminar la categoría", variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus categorías de ingresos y gastos</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><PlusIcon className="w-4 h-4 mr-2" /> Nueva Categoría</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nueva categoría</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Viajes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <SelectItem value="both">Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" className="w-16 h-10 p-1" {...field} />
                            <Input type="text" className="flex-1" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createCategory.isPending}>Guardar</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando categorías...</div>
          ) : categories && categories.length > 0 ? (
            <div className="divide-y divide-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {categories.map((category) => (
                <div key={category.id} className="p-6 border-b border-border sm:border-r flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-medium text-base leading-none">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tipoLabel[category.type] ?? category.type}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No hay categorías. Crea una para comenzar.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
