import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { StateBackupManager, validateAndRepairState, createAutoBackup } from '@/lib/stateBackup'
import { toast } from 'sonner'

export function PersistenceTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testAuthPersistence = () => {
    addTestResult('Testing auth persistence...')
    
    if (isAuthenticated) {
      logout()
      addTestResult('✅ Logged out - auth state cleared')
    } else {
      login(
        { 
          id: 'admin-user', 
          name: 'Admin User', 
          email: 'admin@example.com', 
          role: 'admin',
          tenantId: 'test-tenant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        'admin-token-123'
      )
      addTestResult('✅ Logged in - auth state saved')
    }
  }

  const testCrossTabSync = () => {
    addTestResult('Testing cross-tab sync...')
    
    // Simulate storage change from another tab
    const event = new StorageEvent('storage', {
      key: 'gk-admin-admin-auth-storage',
      newValue: JSON.stringify({
        state: {
          user: { id: 'sync-admin', name: 'Synced Admin', email: 'sync@admin.com', role: 'admin' },
          token: 'synced-admin-token',
          isAuthenticated: true
        },
        version: '1.0',
        timestamp: Date.now()
      }),
      storageArea: localStorage
    })
    
    window.dispatchEvent(event)
    addTestResult('✅ Simulated cross-tab sync event')
  }

  const testStateBackup = () => {
    addTestResult('Testing state backup...')
    
    try {
      const backup = StateBackupManager.createBackup()
      addTestResult(`✅ Backup created at ${new Date(backup.timestamp).toLocaleTimeString()}`)
      
      const backups = StateBackupManager.getBackups()
      addTestResult(`✅ Total backups: ${backups.length}`)
    } catch (error) {
      addTestResult(`❌ Backup failed: ${error}`)
    }
  }

  const testStateValidation = () => {
    addTestResult('Testing state validation...')
    
    try {
      const repaired = validateAndRepairState()
      addTestResult(repaired ? '✅ State repaired' : '✅ State is valid')
    } catch (error) {
      addTestResult(`❌ Validation failed: ${error}`)
    }
  }

  const testAutoBackup = () => {
    addTestResult('Testing auto-backup...')
    
    try {
      createAutoBackup('admin-test-action')
      addTestResult('✅ Auto-backup created')
    } catch (error) {
      addTestResult(`❌ Auto-backup failed: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const clearAllStorage = () => {
    localStorage.clear()
    addTestResult('✅ All localStorage cleared')
    toast.success('Storage cleared - refresh page to see effect')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Panel - Enhanced Persistence System Test</h2>
        
        {/* Current State Display */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Auth State</h3>
          <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p>User: {user?.name || 'None'}</p>
          <p>Role: {user?.role || 'None'}</p>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <button
            onClick={testAuthPersistence}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Test Auth
          </button>
          
          <button
            onClick={testCrossTabSync}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
          >
            Test Sync
          </button>
          
          <button
            onClick={testStateBackup}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
          >
            Test Backup
          </button>
          
          <button
            onClick={testStateValidation}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm"
          >
            Test Validation
          </button>
          
          <button
            onClick={testAutoBackup}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-sm"
          >
            Auto Backup
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
          >
            Clear Results
          </button>
          
          <button
            onClick={clearAllStorage}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
          >
            Clear Storage
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2">Test Results:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-400">No tests run yet. Click buttons above to test functionality.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Test Auth:</strong> Toggle login/logout to test auth persistence</li>
            <li>• <strong>Test Sync:</strong> Simulate cross-tab synchronization</li>
            <li>• <strong>Test Backup:</strong> Create state backups</li>
            <li>• <strong>Test Validation:</strong> Validate and repair state</li>
            <li>• <strong>Auto Backup:</strong> Test automatic backup creation</li>
            <li>• <strong>Clear Storage:</strong> Clear all localStorage (refresh to see effect)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}