/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { ResourcesDropHandler, DragAndDropObserver } from 'vs/workbench/browser/dnd';
import { listDropBackground } from 'vs/platform/theme/common/colorRegistry';
import { SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { ILabelService } from 'vs/platform/label/common/label';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';

export class EmptyView extends ViewPane {

	static readonly ID: string = 'workbench.explorer.emptyView';
	static readonly NAME = nls.localize('noWorkspace', "No Folder Opened");

	constructor(
		options: IViewletViewOptions,
		@IThemeService themeService: IThemeService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@IConfigurationService configurationService: IConfigurationService,
		@ILabelService private labelService: ILabelService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IOpenerService openerService: IOpenerService
	) {
		super({ ...(options as IViewPaneOptions), ariaHeaderLabel: nls.localize('explorerSection', "Explorer Section: No Folder Opened") }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService);

		this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
		this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
	}

	shouldShowWelcome(): boolean {
		return true;
	}

	protected renderBody(container: HTMLElement): void {
		super.renderBody(container);

		this._register(new DragAndDropObserver(container, {
			onDrop: e => {
				const color = this.themeService.getTheme().getColor(SIDE_BAR_BACKGROUND);
				container.style.backgroundColor = color ? color.toString() : '';
				const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: true });
				dropHandler.handleDrop(e, () => undefined, () => undefined);
			},
			onDragEnter: () => {
				const color = this.themeService.getTheme().getColor(listDropBackground);
				container.style.backgroundColor = color ? color.toString() : '';
			},
			onDragEnd: () => {
				const color = this.themeService.getTheme().getColor(SIDE_BAR_BACKGROUND);
				container.style.backgroundColor = color ? color.toString() : '';
			},
			onDragLeave: () => {
				const color = this.themeService.getTheme().getColor(SIDE_BAR_BACKGROUND);
				container.style.backgroundColor = color ? color.toString() : '';
			},
			onDragOver: e => {
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = 'copy';
				}
			}
		}));

		this.refreshTitle();
	}

	private refreshTitle(): void {
		if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
			this.updateTitle(EmptyView.NAME);
		} else {
			this.updateTitle(this.title);
		}
	}

	layoutBody(_size: number): void {
		// no-op
	}
}
