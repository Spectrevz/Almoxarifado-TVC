import { Inject, Injectable } from "@nestjs/common";
import { MovimentacoesService } from "../movimentacoes/movimentacoes.service";
import { MovementsQueryDto } from "./dto/movements-query.dto";

type MovementRow = {
  id: string;
  movimentacaoId: number;
  type: "saída" | "entrada";
  item: string;
  user: string;
  date: string;
  time: string | null;
  status: "ativa" | "concluída";
  returnDate: string | null;
  note: string | null;
};

@Injectable()
export class MovementsService {
  constructor(
    @Inject(MovimentacoesService)
    private readonly movimentacoesService: MovimentacoesService,
  ) {}

  async findAll(query: MovementsQueryDto) {
    const movimentacoes = await this.movimentacoesService.findAll();

    const events = movimentacoes.flatMap<MovementRow>((movimentacao) => {
      const item = movimentacao.kit?.nome ?? `Kit ${movimentacao.kitId}`;
      const saida: MovementRow = {
        id: `${movimentacao.id}-saida`,
        movimentacaoId: movimentacao.id,
        type: "saída",
        item,
        user: movimentacao.responsavelSaida ?? "",
        date: movimentacao.dataSaida,
        time: movimentacao.horaSaida ?? null,
        status: movimentacao.dataDevolucao ? "concluída" : "ativa",
        returnDate: movimentacao.dataDevolucao ?? null,
        note: movimentacao.observacao ?? null,
      };

      const entrada = movimentacao.dataDevolucao
        ? {
            id: `${movimentacao.id}-entrada`,
            movimentacaoId: movimentacao.id,
            type: "entrada" as const,
            item,
            user:
              movimentacao.responsavelRetorno ??
              movimentacao.responsavelSaida ??
              "",
            date: movimentacao.dataDevolucao,
            time: movimentacao.horaDevolucao ?? null,
            status: "concluída" as const,
            returnDate: movimentacao.dataDevolucao,
            note: movimentacao.observacao ?? null,
          }
        : null;

      return entrada ? [entrada, saida] : [saida];
    });

    const normalizedType =
      query.type === "saida" ? "saída" : query.type;
    const normalizedStatus =
      query.status === "concluida" ? "concluída" : query.status;
    const normalizedSearch = query.search?.toLowerCase().trim();

    return events
      .filter((event) => {
        if (normalizedType && event.type !== normalizedType) return false;
        if (normalizedStatus && event.status !== normalizedStatus) return false;

        if (normalizedSearch) {
          const haystack = `${event.item} ${event.user} ${event.note ?? ""}`.toLowerCase();
          return haystack.includes(normalizedSearch);
        }

        return true;
      })
      .sort((a, b) => {
        const left = `${a.date} ${a.time ?? "00:00:00"}`;
        const right = `${b.date} ${b.time ?? "00:00:00"}`;
        return right.localeCompare(left);
      })
      .slice(0, 500)
      .map(({ movimentacaoId, type, ...event }) => ({
        ...event,
        type,
        id: movimentacaoId * 10 + (type === "entrada" ? 2 : 1),
      }));
  }
}
