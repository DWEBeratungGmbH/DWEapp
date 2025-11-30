// Benutzer-Formular Felder Komponente
// Zeigt die editierbaren Felder für einen Benutzer

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { FormData } from '@/hooks/useEditUser'

interface UserFormFieldsProps {
  formData: FormData
  onInputChange: (field: keyof FormData, value: string | boolean) => void
  emailDisabled?: boolean
}

export function UserFormFields({ formData, onInputChange, emailDisabled = true }: UserFormFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">DWEapp Benutzerdaten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Vorname</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              placeholder="Vorname"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nachname</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              placeholder="Nachname"
            />
          </div>
        </div>

        {/* E-Mail */}
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="E-Mail"
            disabled={emailDisabled}
          />
          {emailDisabled && (
            <p className="text-xs text-muted mt-1">E-Mail kann nicht geändert werden</p>
          )}
        </div>

        {/* Rolle & Abteilung */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Rolle</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => onInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Benutzer</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Abteilung</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              placeholder="Abteilung"
            />
          </div>
        </div>

        {/* Aktiv-Status */}
        <div className="flex items-center gap-3">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => onInputChange('isActive', checked)}
          />
          <Label htmlFor="isActive">Benutzer ist aktiv</Label>
        </div>
      </CardContent>
    </Card>
  )
}
