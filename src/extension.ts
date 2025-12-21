import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
	const insertSnippet = vscode.commands.registerCommand(
		"local-snippets.insertSnippet",
		async () => {

			// 1️⃣ Read snippetsPath from settings
			const config = vscode.workspace.getConfiguration("localSnippets");
			const snippetsPath = config.get<string>("snippetsPath");

			if (!snippetsPath) {
				vscode.window
					.showErrorMessage(
						"Snippets path is not set. Please configure 'Local Snippets › Snippets Path'.",
						"Open Settings"
					)
					.then(selection => {
						if (selection === "Open Settings") {
							vscode.commands.executeCommand(
								"workbench.action.openSettings",
								"localSnippets.snippetsPath"
							);
						}
					});
				return;
			}

			// 2️⃣ Validate folder
			if (!fs.existsSync(snippetsPath)) {
				vscode.window.showErrorMessage(
					"Snippets folder does not exist. Check the configured path."
				);
				return;
			}

			// 3️⃣ Read files
			const files = fs
				.readdirSync(snippetsPath)
				.filter(file => !file.startsWith("."));

			if (files.length === 0) {
				vscode.window.showInformationMessage("No snippets found");
				return;
			}

			// 4️⃣ Show QuickPick
			const selected = await vscode.window.showQuickPick(files, {
				placeHolder: "Select a snippet to insert"
			});

			if (!selected) return;

			// 5️⃣ Read snippet content
			const snippetContent = fs.readFileSync(
				path.join(snippetsPath, selected),
				"utf-8"
			);

			// 6️⃣ Insert into editor
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active editor");
				return;
			}

			editor.edit(editBuilder => {
				editBuilder.insert(
					editor.selection.active,
					snippetContent
				);
			});
		}
	);

	context.subscriptions.push(insertSnippet);
}

export function deactivate() {}
