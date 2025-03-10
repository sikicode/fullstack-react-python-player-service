import { render, screen } from '@testing-library/react';
import PlayerMain from '../components/PlayerMain';

describe('PlayerMain Component', () => {
    test('renders main header', () => {
        render(<PlayerMain />);
        const headerElement = screen.getByText("Hello Players");
        expect(headerElement).toBeTruthy();
    });

    test('renders search buttons', () => {
        render(<PlayerMain />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(4);
        expect(buttons[0].textContent).toBe("Submit");
        expect(buttons[1].textContent).toBe("Submit");
    });

    test('renders search inputs', () => {
        render(<PlayerMain />);
        const playerIdInput = screen.getByPlaceholderText("Enter player id...");
        const countryCodeInput = screen.getByPlaceholderText("Enter country code...");
        const nameInput = screen.getByPlaceholderText("Enter player name...");
        
        expect(playerIdInput).toBeTruthy();
        expect(countryCodeInput).toBeTruthy();
        expect(nameInput).toBeTruthy();
    });
});
