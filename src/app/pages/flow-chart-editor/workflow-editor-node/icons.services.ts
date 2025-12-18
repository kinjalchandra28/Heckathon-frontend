import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})
export class IconsService {
    getIcon(type: string): string {
        const icons: Record<string, string> = {
            trigger: '⚡',
            condition: '◇',
            action: '▶',
            notification: '🔔',
        };
        return icons[type] || '●';
    }
}