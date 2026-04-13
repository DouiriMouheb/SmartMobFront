import React, { useMemo } from 'react';
import {
  AlertCircle,
  CalendarRange,
  CheckCircle2,
  Database,
  RefreshCw,
  XCircle,
  CircleSlash,
  BarChart3,
} from 'lucide-react';
import { useAcquisizioniStats } from '../hooks/useAcquisizioniStats';

const clampPercentage = (value) => {
  const normalizedValue = Number(value);
  if (Number.isNaN(normalizedValue)) return 0;
  return Math.min(100, Math.max(0, normalizedValue));
};

const formatCount = (value) => new Intl.NumberFormat('it-IT').format(value ?? 0);
const formatPercentage = (value) => `${clampPercentage(value).toFixed(1)}%`;

const formatApiDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Home = () => {
  const {
    dateRange,
    setStartDate,
    setEndDate,
    stats,
    loading,
    error,
    refetch,
  } = useAcquisizioniStats();

  const overall = stats?.overall ?? {
    total: 0,
    trueCount: 0,
    falseCount: 0,
    nullCount: 0,
    truePercentage: 0,
    falsePercentage: 0,
    nullPercentage: 0,
  };

  const combinations = useMemo(
    () => [...(stats?.combinations ?? [])].sort((a, b) => (b?.total ?? 0) - (a?.total ?? 0)),
    [stats?.combinations]
  );

  const metricCards = [
    {
      key: 'total',
      label: 'Totale Acquisizioni',
      value: overall.total,
      icon: Database,
      valueClass: 'text-slate-900',
      iconBgClass: 'bg-slate-100',
      iconClass: 'text-slate-700',
    },
    {
      key: 'positive',
      label: 'Esito Positivo',
      value: overall.trueCount,
      subtitle: formatPercentage(overall.truePercentage),
      icon: CheckCircle2,
      valueClass: 'text-emerald-700',
      iconBgClass: 'bg-emerald-100',
      iconClass: 'text-emerald-700',
    },
    {
      key: 'negative',
      label: 'Esito Negativo',
      value: overall.falseCount,
      subtitle: formatPercentage(overall.falsePercentage),
      icon: XCircle,
      valueClass: 'text-rose-700',
      iconBgClass: 'bg-rose-100',
      iconClass: 'text-rose-700',
    },
    {
      key: 'not-tested',
      label: 'Non Testato',
      value: overall.nullCount,
      subtitle: formatPercentage(overall.nullPercentage),
      icon: CircleSlash,
      valueClass: 'text-amber-700',
      iconBgClass: 'bg-amber-100',
      iconClass: 'text-amber-700',
    },
  ];

  const distributionRows = [
    {
      key: 'true',
      label: 'Positivi',
      count: overall.trueCount,
      percentage: overall.truePercentage,
      barClass: 'bg-emerald-500',
      color: '#10b981',
    },
    {
      key: 'false',
      label: 'Negativi',
      count: overall.falseCount,
      percentage: overall.falsePercentage,
      barClass: 'bg-rose-500',
      color: '#f43f5e',
    },
    {
      key: 'null',
      label: 'Non testati',
      count: overall.nullCount,
      percentage: overall.nullPercentage,
      barClass: 'bg-amber-500',
      color: '#f59e0b',
    },
  ];

  const pieBackground = useMemo(() => {
    if ((overall.total ?? 0) === 0) {
      return 'conic-gradient(#e2e8f0 0 100%)';
    }

    let currentPercentage = 0;
    const segments = distributionRows.map((row) => {
      const value = clampPercentage(row.percentage);
      const start = currentPercentage;
      currentPercentage += value;
      return `${row.color} ${start}% ${currentPercentage}%`;
    });

    if (currentPercentage < 100) {
      segments.push(`#e2e8f0 ${currentPercentage}% 100%`);
    }

    return `conic-gradient(${segments.join(', ')})`;
  }, [distributionRows, overall.total]);

  return (
    <div className="app-page fade-in space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-800 to-red-900 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-100">
              <BarChart3 className="h-3.5 w-3.5" />
              Dashboard Statistiche
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Panoramica Acquisizioni</h1>
            <p className="mt-2 text-sm text-zinc-200 sm:text-base">
              Monitora i risultati complessivi e il dettaglio per linea/postazione in tempo reale.
            </p>
          </div>

        
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Filtri Periodo</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Data Inizio</span>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Data Fine</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="sm:col-span-2 xl:col-span-2 flex items-end">
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-65"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Aggiornamento...' : 'Aggiorna Statistiche'}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.key}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${metric.valueClass}`}>
                    {formatCount(metric.value)}
                  </p>
                  {metric.subtitle && (
                    <p className="mt-1 text-sm font-medium text-gray-500">{metric.subtitle}</p>
                  )}
                </div>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBgClass}`}>
                  <Icon className={`h-5 w-5 ${metric.iconClass}`} />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 xl:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Distribuzione Esiti</h3>
          <p className="mt-1 text-sm text-gray-500">
            Percentuali calcolate sul totale acquisizioni nel periodo selezionato.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              {distributionRows.map((row) => (
                <div key={row.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{row.label}</span>
                    <span className="text-gray-500">
                      {formatCount(row.count)} ({formatPercentage(row.percentage)})
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row.barClass}`}
                      style={{ width: `${clampPercentage(row.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <div
                className="relative h-44 w-44 rounded-full ring-1 ring-slate-200"
                style={{ backgroundImage: pieBackground }}
              >
                <div className="absolute inset-[23%] flex items-center justify-center rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Totale</p>
                    <p className="text-lg font-bold text-slate-900">{formatCount(overall.total)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full max-w-[220px] space-y-2">
                {distributionRows.map((row) => (
                  <div key={`${row.key}-legend`} className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      {row.label}
                    </span>
                    <span className="font-semibold text-slate-700">{formatPercentage(row.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
     <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 xl:col-span-3">
          <h3 className="text-lg font-semibold text-slate-900">Dettaglio Combinazioni</h3>
          <p className="mt-1 text-sm text-gray-500">
            Breakdown per codLineaProd e codPostazione.
          </p>

          {combinations.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Nessuna combinazione disponibile per l'intervallo selezionato.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2 font-semibold">Linea</th>
                    <th className="px-3 py-2 font-semibold">Postazione</th>
                    <th className="px-3 py-2 font-semibold">Totale</th>
                    <th className="px-3 py-2 font-semibold">Positivo</th>
                    <th className="px-3 py-2 font-semibold">Negativo</th>
                    <th className="px-3 py-2 font-semibold">Non Testato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {combinations.map((combination, index) => (
                    <tr key={`${combination.codLineaProd}-${combination.codPostazione}-${index}`} className="hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-800">
                        {combination.codLineaProd || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">
                        {combination.codPostazione || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-800">
                        {formatCount(combination.total)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-emerald-700">
                        {formatCount(combination.trueCount)} ({formatPercentage(combination.truePercentage)})
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-rose-700">
                        {formatCount(combination.falseCount)} ({formatPercentage(combination.falsePercentage)})
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-amber-700">
                        {formatCount(combination.nullCount)} ({formatPercentage(combination.nullPercentage)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
     
      </section>
    </div>
  );
};

export default Home;
