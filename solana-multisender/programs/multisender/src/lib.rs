use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZ2BeZ7FEfcYkgMQHG7r4s");

#[program]
pub mod multisender {
    use super::*;

    pub fn multisend(ctx: Context<Multisend>, amount: u64) -> Result<()> {
        require!(amount > 0, MultisenderError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: ctx.accounts.source_token.to_account_info(),
            to: ctx.accounts.destination_token.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Multisend<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, constraint = source_token.owner == authority.key())]
    pub source_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub destination_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum MultisenderError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
}
