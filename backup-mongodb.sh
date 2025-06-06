#!/bin/bash

# MongoDB backup script for Nigerian Bill Payment Application
# This script creates a backup of the MongoDB database and maintains a rolling backup history

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mongodb"
MONGODB_URI="mongodb+srv://your_mongodb_atlas_connection_string"
DB_NAME="bills_payment_db"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup at $(date)"
echo "Backup will be saved to $BACKUP_DIR/$TIMESTAMP"

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$TIMESTAMP"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Compress the backup
    echo "Compressing backup..."
    cd "$BACKUP_DIR"
    tar -czf "$TIMESTAMP.tar.gz" "$TIMESTAMP"
    rm -rf "$TIMESTAMP"
    
    echo "Backup compressed as $BACKUP_DIR/$TIMESTAMP.tar.gz"
    
    # Keep only the last N backups
    echo "Cleaning up old backups (keeping last $RETENTION_DAYS backups)..."
    ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +$((RETENTION_DAYS+1)) | xargs -r rm
    
    echo "Backup process completed at $(date)"
else
    echo "Backup failed with error code $?"
    exit 1
fi

# Log backup information
echo "$(date): Backup completed - $TIMESTAMP.tar.gz" >> "$BACKUP_DIR/backup_log.txt"

echo "MongoDB backup completed successfully"
