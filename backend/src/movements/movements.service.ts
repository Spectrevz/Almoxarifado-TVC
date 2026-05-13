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
    const historico = await this.movimentacoesService.listHistorico();

    const events = historico.map<MovementRow>((item) => ({
      id: `${item.movimentacaoId}-${item.tipo}`,
      movimentacaoId: item.movimentacaoId,
      type: item.tipo as MovementRow["type"],
      item: item.kitNome ?? `Kit ${item.kitId}`,
      user: item.responsavel ?? "",
      date: item.data,
      time: item.hora ?? null,
      status: item.status as MovementRow["status"],
      returnDate: item.dataDevolucao ?? null,
      note: item.observacao ?? null,
    }));

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
