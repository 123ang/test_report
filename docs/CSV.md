# CSV Import/Export Fixes

## Issues Found & Fixed

### 1. **Backend Template** (`backend/src/routes/csv.routes.js`)
**Problem:** Template had incomplete data and didn't match new schema fields.
**Fixed:** Updated template to include proper examples with all fields:
```csv
bug,test,result,severity,priority,notes
"Login Bug","Enter invalid password and check error message","Error message displays correctly","High","High","Test on both mobile and desktop"
"Cart Total","Add 2 items ($10 each) and verify total","$20 displayed","Medium","Medium","Check tax calculation"
"Search Function","Search for product name and verify results","10 results shown","Low","Low",""
```

### 2. **Frontend CSV Service** (`frontend/src/services/csvService.js`)
**Problem:** `importTestCases` expected `csvText` parameter but was being called with a `File` object.
**Fixed:** Changed signature to accept `(versionId, file)` and convert file to text internally:
```javascript
async importTestCases(versionId, file) {
  const text = await file.text();
  const res = await api.post(`/csv/import?versionId=${versionId}`, text, {
    headers: { 'Content-Type': 'text/csv' },
  });
  return res.data;
}
```

### 3. **CSV Import Page** (`frontend/src/pages/CSVImportPage.jsx`)
**Problem:** 
- No project/version selection - user couldn't choose where to import
- Outdated guidelines about translations and appName (old schema)
- Navigation to non-existent `/test-cases` route

**Fixed:** Complete rewrite with:
- Project dropdown selector
- Version dropdown (loads based on selected project)
- Proper navigation to `/projects/:projectId/versions/:versionId`
- Updated guidelines matching new schema:
  ```
  - Required columns: bug, test
  - Optional columns: result, severity, priority, notes
  - Severity options: Critical, High, Medium, Low (default: Low)
  - Priority options: High, Medium, Low (default: Low)
  - All test cases will be imported into the selected version
  ```

### 4. **Version Detail Page** (`frontend/src/pages/VersionDetailPage.jsx`)
**Problem:** Inline import was reading file to text then passing text incorrectly.
**Fixed:** Now passes the file object directly and converts versionId to integer:
```javascript
const res = await csvService.importTestCases(parseInt(versionId), file);
```

## How CSV Import/Export Works Now

### Export (from VersionDetailPage)
1. User clicks "Export CSV" button
2. Exports all test cases for current version
3. CSV includes: id, project, version, bug, test, result, status, is_fixed, is_verified, severity, priority, notes, created_by, created_at

### Import (Two Ways)

#### Option 1: From Version Detail Page (Quick Import)
1. User is already viewing a version
2. Clicks "Import CSV" → file picker opens
3. Selects CSV file
4. Test cases imported into current version

#### Option 2: From CSV Import Page (Choose Destination)
1. User goes to Import CSV page
2. Downloads template if needed
3. Selects project from dropdown
4. Selects version from dropdown (filtered by project)
5. Uploads CSV file
6. Test cases imported into selected version
7. Redirected to version detail page

## CSV Format

### Required Columns
- `bug` - Bug/issue name
- `test` - Test description/steps

### Optional Columns
- `result` - Expected or actual result
- `severity` - Critical, High, Medium, Low (defaults to Low)
- `priority` - High, Medium, Low (defaults to Low)
- `notes` - Additional notes

### Example CSV
```csv
bug,test,result,severity,priority,notes
"Login Bug","Enter invalid password","Error displays","High","High","Test on mobile"
"Cart Total","Add 2 items and verify","Total correct","Medium","Medium",""
```

## Backend Access Control
Both import and export now check if user has access to the project (owner OR member).

## Files Modified
1. `backend/src/routes/csv.routes.js` - Updated template
2. `frontend/src/services/csvService.js` - Fixed importTestCases signature
3. `frontend/src/pages/CSVImportPage.jsx` - Complete rewrite with project/version selection
4. `frontend/src/pages/VersionDetailPage.jsx` - Fixed inline import call

## Testing Checklist
- [ ] Download template from CSV Import page
- [ ] Verify template has correct format and examples
- [ ] Import CSV from Version Detail page (quick import)
- [ ] Import CSV from dedicated Import page (with project/version selection)
- [ ] Export CSV from Version Detail page
- [ ] Verify exported CSV matches new schema
- [ ] Try importing with only required columns (bug, test)
- [ ] Try importing with all columns
- [ ] Verify imported test cases appear in correct version

## Notes
- Import always requires a versionId - test cases belong to versions, not standalone
- Export can filter by versionId or projectId
- All CSV operations respect project collaboration (members can import/export)
- Imported test cases are set to "Open" status by default
- Creator is set to the current user
