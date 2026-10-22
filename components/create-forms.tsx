'use client'

import { createCategory } from '@/app/actions/categories'
import { createPaper } from '@/app/actions/questions'
import { ActionForm, SubmitButton } from '@/components/action-form'
import { Icon } from '@/components/icons'

// Inline "add" forms for the Categories and Questions list pages. On success
// the action redirects to the new item; errors (e.g. duplicates) pop up as a toast.

export function NewCategoryForm() {
  return (
    <ActionForm action={createCategory} errorTitle="Couldn’t add the category" className="card p-6">
      <h2 className="text-sm font-semibold text-slate-900">Add category</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="field-label min-w-48 flex-1">
          Name
          <input name="name" required placeholder="e.g. Indian Society" className="field" />
        </label>
        <label className="field-label min-w-48 flex-1">
          Display name (food-world, optional)
          <input name="foodWorldName" className="field" />
        </label>
        <SubmitButton pendingLabel="Adding…">
          <Icon name="plus" /> Add category
        </SubmitButton>
      </div>
    </ActionForm>
  )
}

export function NewPaperForm() {
  return (
    <ActionForm action={createPaper} errorTitle="Couldn’t add the paper" className="card p-6">
      <h2 className="text-sm font-semibold text-slate-900">Add question paper</h2>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="field-label w-28">
          Year
          <input
            name="year"
            type="number"
            required
            min={1950}
            max={2100}
            defaultValue={new Date().getFullYear()}
            className="field"
          />
        </label>
        <label className="field-label w-32">
          Paper
          <select name="name" defaultValue="GS1" className="field">
            <option value="GS1">GS1</option>
            <option value="CSAT">CSAT</option>
          </select>
        </label>
        <label className="field-label w-24">
          Set
          <input name="set" defaultValue="A" maxLength={2} className="field" />
        </label>
        <SubmitButton pendingLabel="Adding…">
          <Icon name="plus" /> Add paper
        </SubmitButton>
      </div>
    </ActionForm>
  )
}
