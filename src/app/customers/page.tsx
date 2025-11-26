import { Users, Plus, Search, Filter } from 'lucide-react'

export default function CustomersPage() {
  // Dummy-Daten für die Demonstration
  const customers = [
    { id: '1', name: 'Müller GmbH', contact: 'Max Müller', email: 'max@mueller-gmbh.de', phone: '01234-567890', status: 'Aktiv' },
    { id: '2', name: 'Schmidt AG', contact: 'Erika Schmidt', email: 'e.schmidt@schmidt-ag.de', phone: '09876-543210', status: 'Aktiv' },
    { id: '3', name: 'Meier Services', contact: 'John Meier', email: 'john@meier-services.com', phone: '05555-123456', status: 'Inaktiv' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Kunden</h1>
        <button className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Neuer Kunde
        </button>
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Kunden suchen..."
            className="input pl-8"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="mt-6 rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Kontakt</th>
              <th className="h-12 px-4 text-left align-middle font-medium">E-Mail</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Telefon</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-medium">{customer.name}</td>
                <td className="p-4 align-middle">{customer.contact}</td>
                <td className="p-4 align-middle">{customer.email}</td>
                <td className="p-4 align-middle">{customer.phone}</td>
                <td className="p-4 align-middle">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    customer.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="p-4 align-middle text-right">
                  <button className="text-primary hover:underline">Bearbeiten</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
