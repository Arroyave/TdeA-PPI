import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListMovements, useGetProfile, useListCategories, useDeleteMovement, getListMovementsQueryKey, getGetDashboardSummaryQueryKey, getGetRecentMovementsQueryKey, getGetMonthlyTrendQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, SearchIcon, FilterIcon, MoreVertical, Trash2Icon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Movements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");

  const { data: profile } = useGetProfile();
  const { data: categories } = useListCategories();
  
  const params: any = {};
  if (search) params.search = search;
  if (type !== "all") params.type = type;
  if (categoryId !== "all") params.categoryId = Number(categoryId);

  const { data: movements, isLoading } = useListMovements(params);
  const deleteMovement = useDeleteMovement();

  const currency = profile?.currency || "COP";

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      deleteMovement.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Movimiento eliminado correctamente" });
            queryClient.invalidateQueries({ queryKey: getListMovementsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetRecentMovementsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
          },
          onError: () => {
            toast({ title: "Error al eliminar el movimiento", variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
            <p className="text-muted-foreground mt-1">Visualiza y gestiona tus transacciones</p>
          </div>
          <Button asChild>
            <Link href="/movements/new">Nuevo Movimiento</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar descripción..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Tipo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Categoría" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando movimientos...</div>
          ) : movements && movements.length > 0 ? (
            <div className="divide-y divide-border">
              {movements.map((movement) => (
                <div key={movement.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: movement.categoryColor || "hsl(var(--muted))" }}
                    >
                      {movement.type === "income" ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{movement.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{new Date(movement.date + "T12:00:00").toLocaleDateString("es-CO")}</span>
                        {movement.categoryName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: movement.categoryColor || "transparent" }} />
                              {movement.categoryName}
                            </span>
                          </>
                        )}
                      </div>
                      {movement.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs sm:max-w-md">{movement.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-semibold text-right ${movement.type === 'income' ? 'text-emerald-600 dark:text-emerald-500' : 'text-foreground'}`}>
                      <div className="text-lg">
                        {movement.type === "income" ? "+" : "-"}{formatCurrency(movement.amount, currency)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDelete(movement.id)} className="text-destructive focus:bg-destructive/10">
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No se encontraron movimientos</h3>
              <p className="text-muted-foreground mt-1 mb-4">No hay resultados que coincidan con los filtros aplicados.</p>
              <Button variant="outline" onClick={() => { setSearch(""); setType("all"); setCategoryId("all"); }}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
