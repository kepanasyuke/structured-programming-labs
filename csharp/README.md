# C#-часть

8 консольных приложений на .NET 8. Каждый проект — отдельная папка с `Program.cs` и `.csproj`, запуск:

```bash
dotnet run --project TextStats -- ../../data/sample.txt
```

Без аргументов приложение берёт файл из `../../data/` относительно каталога сборки.

Почему здесь нет сервисов и DI: задача — показать структурное программирование. Вся логика — `static`-методы в `static class Program`, состояние передаётся аргументами. Классы используются только там, где без них неудобно: `readonly record struct` для точки данных и небольшие неизменяемые типы для строки отчёта (`ColumnProfile`, `Violation`, `Measurement`). Это контейнеры данных, а не носители поведения.

| Проект | Задача | Ключевые методы |
|--------|--------|-----------------|
| TextStats | частота слов, топ-N, стоп-слова | `TryReadText`, `SplitWords`, `CountWords`, `SelectTop`, `CompareByFrequency` |
| CsvProfiler | профиль колонок CSV | `TryReadCsv`, `ProfileColumn`, `DetectType`, `FillRange`, `PrintProfiles` |
| RpnCalc | разбор и вычисление выражения | `Tokenize`, `TryToRpn`, `TryEvaluate`, `ApplyOperator` |
| DqChecks | правила качества данных и проверка ИНН | `BuildRules`, `RunChecks`, `CheckInn`, `HasValidInnChecksum` |
| LogParser | статистика по логу задач | `ParseLine`, `Aggregate`, `Percentile`, `PrintReport` |
| SortBench | три сортировки и замер | `insertionSort`, `mergeSort`, `quickSort`, `Measure` |
| DatePeriods | отчётные периоды и контроль разрывов | `GeneratePeriods`, `FindIntersections`, `FindGaps` |
| MovingAverage | среднее и выбросы | `MovingAverage`, `ZScore`, `FindOutliers`, `BuildBar` |

Сборка всех проектов сразу:

```bash
for p in */*.csproj; do dotnet build "$p"; done
```
