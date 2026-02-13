export const TEST_CASE_TEMPLATES = [
  {
    key: 'login_flow',
    translations: {
      en: {
        title: 'Login Flow',
        description: 'Verify the login functionality works correctly',
        steps: '1. Navigate to the login page\n2. Enter a valid email address\n3. Enter the correct password\n4. Click the Login button\n5. Verify the user is redirected to the dashboard',
        expectedResult: 'User is successfully logged in and redirected to the dashboard'
      },
      ja: {
        title: 'ログインフロー',
        description: 'ログイン機能が正しく動作することを確認する',
        steps: '1. ログインページに移動する\n2. 有効なメールアドレスを入力する\n3. 正しいパスワードを入力する\n4. ログインボタンをクリックする\n5. ダッシュボードにリダイレクトされることを確認する',
        expectedResult: 'ユーザーが正常にログインし、ダッシュボードにリダイレクトされる'
      }
    }
  },
  {
    key: 'form_validation',
    translations: {
      en: {
        title: 'Form Validation',
        description: 'Test form validation for required fields and error messages',
        steps: '1. Open the form page\n2. Leave all required fields empty\n3. Click the Submit button\n4. Verify error messages appear for each required field\n5. Fill in valid data and submit\n6. Verify form submits successfully',
        expectedResult: 'Error messages display correctly for empty required fields, and form submits when valid data is provided'
      },
      ja: {
        title: 'フォームバリデーション',
        description: '必須フィールドとエラーメッセージのフォームバリデーションをテストする',
        steps: '1. フォームページを開く\n2. すべての必須フィールドを空のままにする\n3. 送信ボタンをクリックする\n4. 各必須フィールドにエラーメッセージが表示されることを確認する\n5. 有効なデータを入力して送信する\n6. フォームが正常に送信されることを確認する',
        expectedResult: '空の必須フィールドに対してエラーメッセージが正しく表示され、有効なデータが提供されるとフォームが送信される'
      }
    }
  },
  {
    key: 'crud_operation',
    translations: {
      en: {
        title: 'CRUD Operation',
        description: 'Test Create, Read, Update, and Delete operations',
        steps: '1. Create a new record with valid data\n2. Verify the record appears in the list\n3. View the record details\n4. Edit the record and save changes\n5. Verify changes are reflected\n6. Delete the record\n7. Verify the record is removed from the list',
        expectedResult: 'All CRUD operations (Create, Read, Update, Delete) work correctly'
      },
      ja: {
        title: 'CRUD操作',
        description: '作成、読み取り、更新、削除の操作をテストする',
        steps: '1. 有効なデータで新しいレコードを作成する\n2. レコードがリストに表示されることを確認する\n3. レコードの詳細を表示する\n4. レコードを編集して変更を保存する\n5. 変更が反映されていることを確認する\n6. レコードを削除する\n7. レコードがリストから削除されたことを確認する',
        expectedResult: 'すべてのCRUD操作（作成、読み取り、更新、削除）が正しく機能する'
      }
    }
  },
  {
    key: 'api_endpoint',
    translations: {
      en: {
        title: 'API Endpoint Test',
        description: 'Test API endpoint response and data validation',
        steps: '1. Send a request to the API endpoint with valid parameters\n2. Verify the response status code is 200\n3. Verify the response body contains expected data structure\n4. Send a request with invalid parameters\n5. Verify appropriate error response is returned\n6. Verify error message is descriptive',
        expectedResult: 'API returns correct status codes, data structure, and error messages'
      },
      ja: {
        title: 'APIエンドポイントテスト',
        description: 'APIエンドポイントのレスポンスとデータ検証をテストする',
        steps: '1. 有効なパラメータでAPIエンドポイントにリクエストを送信する\n2. レスポンスステータスコードが200であることを確認する\n3. レスポンスボディに期待されるデータ構造が含まれていることを確認する\n4. 無効なパラメータでリクエストを送信する\n5. 適切なエラーレスポンスが返されることを確認する\n6. エラーメッセージが説明的であることを確認する',
        expectedResult: 'APIが正しいステータスコード、データ構造、エラーメッセージを返す'
      }
    }
  },
  {
    key: 'ui_navigation',
    translations: {
      en: {
        title: 'UI Navigation',
        description: 'Test navigation between different pages and sections',
        steps: '1. Click on each navigation menu item\n2. Verify each page loads correctly\n3. Verify the active menu item is highlighted\n4. Test breadcrumb navigation if present\n5. Test back button functionality\n6. Verify URL changes appropriately',
        expectedResult: 'All navigation links work correctly and pages load as expected'
      },
      ja: {
        title: 'UIナビゲーション',
        description: '異なるページとセクション間のナビゲーションをテストする',
        steps: '1. 各ナビゲーションメニュー項目をクリックする\n2. 各ページが正しく読み込まれることを確認する\n3. アクティブなメニュー項目がハイライトされていることを確認する\n4. パンくずナビゲーションがある場合はテストする\n5. 戻るボタンの機能をテストする\n6. URLが適切に変更されることを確認する',
        expectedResult: 'すべてのナビゲーションリンクが正しく機能し、ページが期待通りに読み込まれる'
      }
    }
  },
  {
    key: 'custom',
    translations: {
      en: {
        title: 'Custom Test Case',
        description: '',
        steps: '',
        expectedResult: ''
      },
      ja: {
        title: 'カスタムテストケース',
        description: '',
        steps: '',
        expectedResult: ''
      }
    }
  }
];
