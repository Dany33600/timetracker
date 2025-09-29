# Configuration des Règles de Sécurité Firestore

## Problème Identifié
Votre base de données Firestore est vide et l'application ne peut pas créer de données car les règles de sécurité par défaut bloquent toutes les opérations.

## Solution : Configurer les Règles Firestore

### 1. Aller dans la Console Firebase
1. Ouvrez [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"Firestore Database"**
4. Cliquez sur l'onglet **"Rules"** (Règles)

### 2. Remplacer les Règles par Défaut
Remplacez le contenu actuel par ces règles de sécurité :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection 'clients'
    match /clients/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Règles pour la collection 'timeEntries'
    match /timeEntries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Publier les Règles
1. Cliquez sur **"Publish"** (Publier)
2. Confirmez la publication

### 4. Tester l'Application
Après avoir publié les règles :
1. Retournez sur votre application
2. Connectez-vous avec votre compte
3. Essayez de créer un nouveau client
4. Les données devraient maintenant s'enregistrer correctement

## Explication des Règles

- **`request.auth != null`** : Vérifie que l'utilisateur est authentifié
- **`request.auth.uid == resource.data.userId`** : Vérifie que l'utilisateur ne peut accéder qu'à ses propres données
- **`allow create`** : Permet la création de nouveaux documents
- **`allow read, write`** : Permet la lecture, modification et suppression

## Vérification
Une fois les règles configurées, vous devriez pouvoir :
- ✅ Créer des clients
- ✅ Ajouter des entrées de temps
- ✅ Voir vos données dans la console Firebase
- ✅ Modifier et supprimer vos données

Si vous avez encore des problèmes, vérifiez que :
1. Vous êtes bien connecté à l'application
2. Les règles ont été correctement publiées
3. Votre configuration Firebase est correcte