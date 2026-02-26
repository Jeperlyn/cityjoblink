<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased">
    <div class="bg-white dark:bg-slate-900">
        <!-- Navigation -->
        <nav class="border-b border-slate-200 dark:border-slate-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="text-2xl font-bold text-slate-900 dark:text-white">
                        {{ config('app.name', 'CityJobLink') }}
                    </div>
                    <div class="space-x-4">
                        @auth
                            <span class="text-slate-700 dark:text-slate-300">{{ Auth::user()->name }}</span>
                            <form method="POST" action="{{ route('logout') }}" class="inline">
                                @csrf
                                <button type="submit" class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                                    Logout
                                </button>
                            </form>
                        @endauth
                    </div>
                </div>
            </div>
        </nav>

        <!-- Toast Container (Include once at layout level) -->
        @include('components.toast-container')

        <!-- Success Alert Container (Include once at layout level) -->
        @include('components.success-alert')

        <!-- Page Content -->
        <main class="min-h-[calc(100vh-64px)]">
            {{ $slot }}
        </main>

        <!-- Flash Messages Initialization -->
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Handle success messages
                @if (session('success'))
                    Toast.success("{{ session('success') }}");
                @endif

                // Handle error messages
                @if (session('error'))
                    Toast.error("{{ session('error') }}");
                @endif

                // Handle warning messages
                @if (session('warning'))
                    Toast.warning("{{ session('warning') }}");
                @endif

                // Handle info messages
                @if (session('info'))
                    Toast.info("{{ session('info') }}");
                @endif
            });
        </script>
    </div>
</body>
</html>
