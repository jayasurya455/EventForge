import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'leagues',
        pathMatch: 'full'
    },
    {
        path: 'leagues',
        loadComponent: () =>
            import('./leagues/components/league-list.component/league-list.component')
                .then(m => m.LeagueListComponent),
    },
    {
        path: 'leagues/create',
        loadComponent: () =>
            import('./leagues/components/league-form.component/league-form.component')
                .then(m => m.LeagueFormComponent)
    },
    {
        path: 'teams/view',
        loadComponent: () =>
            import('./teams/components/teams-view.component/teams-view.component')
                .then(m => m.TeamsViewComponent)
    },
    {
        path: 'players/view',
        loadComponent: () =>
            import('./players/components/players-view.component/players-view.component')
                .then(m => m.PlayersViewComponent)
    },
    {
        path: 'teams/create',
        loadComponent: () =>
            import('./teams/components/team-form.component/team-form.component')
                .then(m => m.TeamFormComponent)
    },
    {
        path: 'players/create',
        loadComponent: () =>
            import('./players/components/player-form.component/player-form.component')
                .then(m => m.PlayerFormComponent)
    },
    {
        path: 'leagues/:id/edit',
        loadComponent: () =>
            import('./leagues/components/league-form.component/league-form.component')
                .then(m => m.LeagueFormComponent)
    },
    {
        path: 'teams/:id/edit',
        loadComponent: () =>
            import('./teams/components/team-form.component/team-form.component')
                .then(m => m.TeamFormComponent)
    },
    {
        path: 'players/:id/edit',
        loadComponent: () =>
            import('./players/components/player-form.component/player-form.component')
                .then(m => m.PlayerFormComponent)
    },
    {
        path: 'auctions-steps',
        loadComponent: () =>
            import('./auctions/components/auction-wizard.component/auction-wizard.component')
                .then(m => m.AuctionWizardComponent)
    },
    {
        path: 'auctions-details',
        loadComponent: () =>
            import('./auctions/components/auction-list.component/auction-list.component')
                .then(m => m.AuctionListComponent)
    },
    {
        path: 'auctions-live',
        loadComponent: () =>
            import('./auctions/components/auction-live.component/auction-live.component')
                .then(m => m.AuctionLiveComponent)
    },
    {
        path: 'auctions',
        loadComponent: () =>
            import('./auctions/components/auction-list.component/auction-list.component')
                .then(m => m.AuctionListComponent)
    },
    {
        path: 'auction-squads',
        loadComponent: () =>
            import('./auctions/components/auction-squads-overview/auction-squads-overview.component')
                .then(m => m.AuctionSquadsOverviewComponent)
    }
];
