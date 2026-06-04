# How to Build and Install the SansarPlus WordPress Theme

## Step 1: Build the React App
1. Open your terminal in the project root.
2. Run:
   ```bash
   npm run build
   ```
   This creates a `build` folder with your compiled app.

## Step 2: Prepare the Theme Folder
1. Create a new folder on your desktop named `sansarplus-theme`.
2. Inside `sansarplus-theme`, create the three files provided in the theme/ folder:
   - `index.php`
   - `style.css`
   - `functions.php`
3. Copy the entire `build` folder (from Step 1) into `sansarplus-theme`.

**Structure:**
```
sansarplus-theme/
├── index.php
├── style.css
├── functions.php
└── build/
    ├── index.html (unused by WP, but safe to keep)
    └── static/
        ├── js/
        └── css/
```

## Step 3: Create the ZIP
1. Right-click the `sansarplus-theme` folder.
2. Select **Compress to ZIP file**.
3. You now have `sansarplus-theme.zip`.

## Step 4: Install in WordPress
1. Log in to your WordPress Admin.
2. Go to **Appearance > Themes**.
3. Click **Add New** -> **Upload Theme**.
4. Upload `sansarplus-theme.zip`.
5. Click **Install Now** and **Activate**.

Your WordPress site will now load the SansarPlus application on the homepage!