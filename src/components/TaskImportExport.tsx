import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Task, TaskImportMode } from '../types/task'
import {
  createTaskExportFile,
  createTaskId,
  normalizeTasks,
} from '../utils/taskUtils'

type TaskImportExportProps = {
  tasks: Task[]
  onImportTasks: (tasks: Task[], importMode: TaskImportMode) => void
}

type ImportExportMessage = {
  type: 'success' | 'warning' | 'error'
  text: string
}

const exportFileName = 'task-board-tasks.json'

const extractTaskValues = (value: unknown): unknown[] | null => {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'object' || value === null) {
    return null
  }

  const exportFile = value as Record<string, unknown>

  if (Array.isArray(exportFile.tasks)) {
    return exportFile.tasks
  }

  return null
}

const hasDuplicateTaskIds = (tasks: Task[]) => {
  const taskIds = new Set<string>()

  for (const task of tasks) {
    if (taskIds.has(task.id)) {
      return true
    }

    taskIds.add(task.id)
  }

  return false
}

const createUniqueTaskId = (usedTaskIds: Set<string>) => {
  let taskId = createTaskId()

  while (usedTaskIds.has(taskId)) {
    taskId = createTaskId()
  }

  usedTaskIds.add(taskId)

  return taskId
}

const resolveAppendTaskIds = (tasks: Task[], existingTasks: Task[]) => {
  const usedTaskIds = new Set(existingTasks.map((task) => task.id))

  return tasks.map((task) => {
    if (!usedTaskIds.has(task.id)) {
      usedTaskIds.add(task.id)
      return task
    }

    return {
      ...task,
      id: createUniqueTaskId(usedTaskIds),
    }
  })
}

export const TaskImportExport = ({
  tasks,
  onImportTasks,
}: TaskImportExportProps) => {
  const [importMode, setImportMode] = useState<TaskImportMode>('append')
  const [message, setMessage] = useState<ImportExportMessage | null>(null)

  const handleExportTasks = () => {
    const exportFile = createTaskExportFile(tasks)
    const blob = new Blob([JSON.stringify(exportFile, null, 2)], {
      type: 'application/json',
    })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = objectUrl
    link.download = exportFileName
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)

    setMessage({
      type: 'success',
      text: `${tasks.length}件のタスクをJSONファイルとして書き出しました。`,
    })
  }

  const handleImportFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const parsedJson: unknown = JSON.parse(await file.text())
      const taskValues = extractTaskValues(parsedJson)

      if (taskValues === null) {
        setMessage({
          type: 'error',
          text: 'JSON内にインポートできるタスク配列がありません。',
        })
        return
      }

      const normalizedTasks = normalizeTasks(taskValues)

      if (normalizedTasks === null) {
        setMessage({
          type: 'error',
          text: '不正なタスクデータが含まれているため、インポートしませんでした。',
        })
        return
      }

      if (normalizedTasks.length === 0) {
        setMessage({
          type: 'warning',
          text: 'インポート対象のタスクがありません。',
        })
        return
      }

      if (importMode === 'replace' && hasDuplicateTaskIds(normalizedTasks)) {
        setMessage({
          type: 'error',
          text: '同じIDのタスクが含まれているため、置き換えインポートを中止しました。',
        })
        return
      }

      const importedTasks =
        importMode === 'append'
          ? resolveAppendTaskIds(normalizedTasks, tasks)
          : normalizedTasks

      onImportTasks(importedTasks, importMode)

      setMessage({
        type: 'success',
        text:
          importMode === 'append'
            ? `${importedTasks.length}件のタスクを追加しました。現在の表示条件により一部のタスクが非表示の場合があります。`
            : `${importedTasks.length}件のタスクで置き換えました。`,
      })
    } catch {
      setMessage({
        type: 'error',
        text: 'JSONファイルを読み込めませんでした。ファイルの形式を確認してください。',
      })
    }
  }

  return (
    <div className="data-management">
      <div className="data-management__export">
        <button
          className="secondary-button"
          type="button"
          onClick={handleExportTasks}
        >
          JSONエクスポート
        </button>
      </div>

      <fieldset className="import-mode-control">
        <legend>インポート方法</legend>
        <div className="import-mode-control__options">
          <label className="import-mode-control__option">
            <input
              type="radio"
              name="task-import-mode"
              value="append"
              checked={importMode === 'append'}
              onChange={() => setImportMode('append')}
            />
            <span>現在のタスクに追加</span>
          </label>
          <label className="import-mode-control__option">
            <input
              type="radio"
              name="task-import-mode"
              value="replace"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
            />
            <span>現在のタスクを置き換え</span>
          </label>
        </div>
      </fieldset>

      <div className="field data-management__import">
        <label htmlFor="task-import-file">JSONインポート</label>
        <input
          id="task-import-file"
          type="file"
          accept=".json,application/json"
          onChange={handleImportFileChange}
        />
      </div>

      {message ? (
        <p
          className={`data-management__message data-management__message--${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
