// State backup and recovery utilities
export interface StateBackup {
  timestamp: number
  version: string
  auth: any
  tenant: any
  ui: any
}

export class StateBackupManager {
  private static readonly BACKUP_KEY = 'gk-admin-backup'
  private static readonly MAX_BACKUPS = 5

  static createBackup(): StateBackup {
    const backup: StateBackup = {
      timestamp: Date.now(),
      version: '1.0',
      auth: this.getStorageItem('admin-auth-storage'),
      tenant: this.getStorageItem('tenant-storage'),
      ui: this.getStorageItem('ui-storage'),
    }

    this.saveBackup(backup)
    return backup
  }

  static restoreFromBackup(backup: StateBackup): boolean {
    try {
      if (backup.auth) {
        this.setStorageItem('admin-auth-storage', backup.auth)
      }
      if (backup.tenant) {
        this.setStorageItem('tenant-storage', backup.tenant)
      }
      if (backup.ui) {
        this.setStorageItem('ui-storage', backup.ui)
      }

      // Trigger storage events to notify stores
      window.dispatchEvent(new Event('storage'))
      
      return true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return false
    }
  }

  static getBackups(): StateBackup[] {
    try {
      const backups = localStorage.getItem(this.BACKUP_KEY)
      return backups ? JSON.parse(backups) : []
    } catch (error) {
      console.error('Failed to get backups:', error)
      return []
    }
  }

  static clearBackups(): void {
    localStorage.removeItem(this.BACKUP_KEY)
  }

  private static saveBackup(backup: StateBackup): void {
    try {
      const backups = this.getBackups()
      backups.unshift(backup)
      
      // Keep only the most recent backups
      const trimmedBackups = backups.slice(0, this.MAX_BACKUPS)
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(trimmedBackups))
    } catch (error) {
      console.error('Failed to save backup:', error)
    }
  }

  private static getStorageItem(key: string): any {
    try {
      const item = localStorage.getItem(`gk-admin-${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error)
      return null
    }
  }

  private static setStorageItem(key: string, value: any): void {
    try {
      localStorage.setItem(`gk-admin-${key}`, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error)
    }
  }
}

// Auto-backup on critical actions
export function createAutoBackup(action: string): void {
  try {
    const backup = StateBackupManager.createBackup()
    console.log(`Auto-backup created for action: ${action}`, backup.timestamp)
  } catch (error) {
    console.error('Failed to create auto-backup:', error)
  }
}

// State validation and repair
export function validateAndRepairState(): boolean {
  let repaired = false

  try {
    // Validate auth state
    const authState = localStorage.getItem('gk-admin-admin-auth-storage')
    if (authState) {
      const parsed = JSON.parse(authState)
      if (!parsed.state || typeof parsed.state.isAuthenticated !== 'boolean') {
        console.warn('Invalid auth state detected, clearing...')
        localStorage.removeItem('gk-admin-admin-auth-storage')
        localStorage.removeItem('admin_token')
        repaired = true
      }
    }

    if (repaired) {
      console.log('State validation completed with repairs')
      window.dispatchEvent(new Event('storage'))
    }

    return repaired
  } catch (error) {
    console.error('Failed to validate and repair state:', error)
    return false
  }
}