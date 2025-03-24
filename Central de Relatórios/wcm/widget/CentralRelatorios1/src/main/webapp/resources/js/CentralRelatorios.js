var CentralRelatorios1 = SuperWidget.extend({
	loading: null,
	init: function () {
		$("#divCompromissosCadastrados, #divDespesasFinanceiro").hide();
		IniciaCamposDeData();
		VerificaPermissoes();

		$("#selectRelatorio").on("change", function () {
			AlteraRelatorio($(this).val());
		});

		$(".btnGerar").on("click", function () {
			loading = FLUIGC.loading(window, {
				textMessage: 'Gerando relatório... Aguarde...',
				title: null,
				css: {
					padding: 0,
					margin: 0,
					textAlign: 'center',
					color: '#000',
					border: '3px solid #aaa',
					backgroundColor: '#fff',
					cursor: 'wait',
					width: "70%",
					left: '15%'
				},
				overlayCSS: {
					backgroundColor: '#000',
					opacity: 0.6,
					cursor: 'wait'
				},
				cursorReset: 'default',
				baseZ: 1000,
				centerX: true,
				centerY: true,
				bindEvents: true,
				fadeIn: 200,
				fadeOut: 400,
				timeout: 0,
				showOverlay: true,
				onBlock: GerarRelatorio(),
				onUnblock: null,
				ignoreIfBlocked: false
			});
			loading.show();
		});
	}
});


// Main
async function VerificaPermissoes() {
	$("#selectRelatorio").html("<option></option>");

	var PermissaoMatriz = await VerificaSeUsuarioPertenceAosGrupos(WCMAPI.userCode, ["Planejamento", "Controladoria", "Administrador TI", "Engenheiros"]);
	if (PermissaoMatriz.length > 0) {
		//Se usuário tem Permissão como Matriz
		BuscaRelatoriosMatriz();
	}
	else {
	
		var PermissaoChefeEscritorio = await VerificaSeUsuarioPertenceAosGrupos(WCMAPI.userCode, ["Chefes de Escritório"]);
		console.log("CHEFE = "+PermissaoChefeEscritorio.length);
		
		if (PermissaoChefeEscritorio.length > 0) {
			
			//	for (var x = 0; x < PermissaoChefeEscritorio.length; x++) {
			//	var chefe = PermissaoChefeEscritorio.getValue(x, "colleagueGroupPK.colleagueId");
			//	log.info("CHEFE: " + chefe + " - NUM: "+ x);
				
			var PermissaoCentral = await VerificaSeUsuarioPertenceAosGrupos(WCMAPI.userCode, ["Central%"]);
			console.log("CENTRAL = "+PermissaoCentral.length);
			
			if (PermissaoCentral.length > 0) {
				BuscaRelatoriosObra();
			}
			else {
				BuscaRelatoriosMatriz();
			}
			
		}		
		else {
			var PermissaoObra = await VerificaSeUsuarioPertenceAosGrupos(WCMAPI.userCode, ["Matriz", "Obra%", "Britagem%", "Central%", "Regional%"]);
			if (PermissaoObra.length > 0) {
				//Se usuário tem permissão Obra
				BuscaRelatoriosObra();
			}
			else {
				//Se usuário não é nem Obra nem Matriz
				FLUIGC.toast({
					message: "Usuário sem permissão em nenhum relatório.",
					type: "warning"
				});
			}
		}

	}
	/*var PermissaoEngenheiroOuChefe = await VerificaSeUsuarioPertenceAosGrupos(WCMAPI.userCode, ["Engenheiros", "Chefes de Escritório"]);
	if (PermissaoEngenheiroOuChefe.length > 0) {
		//Se Usuário Eng ou Chefe
		$("#selectRelatorio").append("<option value='Despesas Econômicas'>Despesas Econômicas</option>")
		$("#selectRelatorio").append("<option value='Controle de Faturamento'>Controle de Faturamento</option>")
		$("#selectRelatorio").append("<option value='Custos Mão de Obra'>Custos Mão de Obra</option>")
	}*/
}
function AlteraRelatorio(relatorio) {
	if (relatorio == "Compromissos Cadastrados por Centro de Custo" || relatorio == "Compromissos Cadastrados (FFCX/RDV/RDO)") {
		$("#divCompromissosCadastrados").slideDown();
	}
	else {
		$("#divCompromissosCadastrados").slideUp();
	}

	if (relatorio == "Despesas Econômicas" || relatorio == "Controle de Faturamento" || relatorio == "Custos Mão de Obra" || relatorio == "Compromissos Gerenciais" || relatorio == "Ordens Pendentes") {
		$("#divDespesasFinanceiro").slideDown();
		BuscaObras();
	} else {
		$("#divDespesasFinanceiro").slideUp();
	}
}
async function GerarRelatorio() {
	var user = WCMAPI.userCode;
	if (user == "alysson.silva1") {
		user = "alysson.silva";
	} else if (user == "ademir.rodrigues") {
		user = "ademir";
	} else if (user == "fernando.jarvorski") {
		user = "fernandoj";
	} else if (user == "fernando.almeida") {
		user = "fernandoa";
	}


	var relatorio = $("#selectRelatorio").val();

	if (relatorio == "Compromissos Cadastrados por Centro de Custo") {
		GeraCompromissosCadastrados(1);
	}
	else if (relatorio == "Compromissos Cadastrados (FFCX/RDV/RDO)") {
		GeraCompromissosCadastrados(2);
	}
	else if (relatorio == "Despesas Econômicas") {
		GeraDespesasEconomicasObra($("#selectCCUSTO").val(), user, await BuscaEmailUsuario());
	}
	else if (relatorio == "Controle de Faturamento") {
		GeraControleFaturamento($("#selectCCUSTO").val(), user, await BuscaEmailUsuario());
	}
	else if (relatorio == "Custos Mão de Obra") {
		GeraCustoMaoDeObra($("#selectCCUSTO").val(), user, await BuscaEmailUsuario());
	}
	else if (relatorio == "Compromissos Gerenciais") {
		GeraCompromissosGerenciais($("#selectCCUSTO").val(), user, await BuscaEmailUsuario());
	}
	else if (relatorio == "Ordens Pendentes") {
		GeraOrdensPendentes($("#selectCCUSTO").val(), user, await BuscaEmailUsuario());
	}
	else {
		FLUIGC.toast({
			message: "Nenhum relatório selecionado!",
			type: "warning"
		});
	}
}


// Lista Relatorios
function BuscaRelatoriosMatriz() {
	/*DatasetFactory.getDataset("BuscaRelatorios", null, [
		DatasetFactory.createConstraint("Matriz", "true", "true", ConstraintType.MUST)
	], null, {
		success: (ds => {
			ds.values.forEach(relatorio => {
				$("#selectRelatorio").append("<option value='" + relatorio.NOME + "'>" + relatorio.NOME + "</option>");
			})
		}),
		error: (error => {
			console.error(error);
			FLUIGC.toast({
				message: "Erro ao verificar as permissões do usuário, favor entrar em contato com o Administrador do Sistema.",
				type: "warning"
			});
		})
	})*/

	$("#selectRelatorio").append("<optgroup label='ACOMPANHAMENTO GERENCIAL DE OBRAS'></optgroup>");
	$("#selectRelatorio").append("<option value='Compromissos Gerenciais'>Compromissos Gerenciais</option>");
	$("#selectRelatorio").append("<option value='Controle de Faturamento'>Controle de Faturamento</option>");
	$("#selectRelatorio").append("<option value='Custos Mão de Obra'>Custos Mão de Obra</option>");
	$("#selectRelatorio").append("<option value='Despesas Econômicas'>Despesas Econômicas</option>");
	$("#selectRelatorio").append("<optgroup label='RELATÓRIOS DIÁRIOS'></optgroup>");	
	$("#selectRelatorio").append("<option value='Compromissos Cadastrados por Centro de Custo'>Compromissos Cadastrados por Centro de Custo</option>");
	$("#selectRelatorio").append("<option value='Compromissos Cadastrados (FFCX/RDV/RDO)'>Compromissos Cadastrados (FFCX/RDV/RDO)</option>");
	$("#selectRelatorio").append("<option value='Ordens Pendentes'>Ordens Pendentes (Follow-up)</option>");

}
function BuscaRelatoriosObra() {
	/*DatasetFactory.getDataset("BuscaRelatorios", null, [
		DatasetFactory.createConstraint("Obra", "true", "true", ConstraintType.MUST)
	], null, {
		success: (ds => {
			console.log(ds)
			ds.values.forEach(relatorio => {
				$("#selectRelatorio").append("<option value='" + relatorio.NOME + "'>" + relatorio.NOME + "</option>");
			})
		}),
		error: (error => {
			console.error(error);
			FLUIGC.toast({
				message: "Erro ao verificar as permissões do usuário, favor entrar em contato com o Administrador do Sistema.",
				type: "warning"
			});
		})
	})
	*/
	$("#selectRelatorio").html("<option></option>");
	
	$("#selectRelatorio").append("<optgroup label='RELATÓRIOS DIÁRIOS'></optgroup>");	
	$("#selectRelatorio").append("<option value='Compromissos Cadastrados por Centro de Custo'>Compromissos Cadastrados por Centro de Custo</option>");
	$("#selectRelatorio").append("<option value='Compromissos Cadastrados (FFCX/RDV/RDO)'>Compromissos Cadastrados (FFCX/RDV/RDO)</option>");
	$("#selectRelatorio").append("<option value='Ordens Pendentes'>Ordens Pendentes (Follow-up)</option>");
}


// Gera Relatorios
function GeraDespesasObra() {
	var user = WCMAPI.userCode;
	if (user == "alysson.silva1") {
		user = "alysson.silva";
	} else if (user == "ademir.rodrigues") {
		user = "ademir";
	} else if (user == "fernando.jarvorski") {
		user = "fernandoj";
	} else if (user == "fernando.almeida") {
		user = "fernandoa";
	}

	DatasetFactory.getDataset("colleague", ["mail"], [
		DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST)
	], null, {

		success: (ds => {
			var mail = ds.values[0].mail;


			var xml =
				"<PARAM>\
				<USUARIO>" + user + "</USUARIO>\
				<EMAIL>" + mail + "</EMAIL>\
				<CCUSTO>" + $("#selectCCUSTO").val() + "</CCUSTO>\
			</PARAM>";

			//console.log(xml);
		})


	});
}
function GeraDespesasEconomicasObra(codccusto, usuario, email) {
	var xml =
		"<PARAM>\
			<CODCCUSTO>" + codccusto + "</CODCCUSTO>\
			<USUARIO>" + usuario + "</USUARIO>\
			<EMAIL>" + email + "</EMAIL>\
		</PARAM>";

	DatasetFactory.getDataset("ExecutaRelatorio", null, [
		DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
		DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
		DatasetFactory.createConstraint("pIdFormula", 25, 25, ConstraintType.MUST)
	], null, {
		success: (retorno => {
			console.log(retorno);
			loading.hide();
			FLUIGC.message.alert({
				message: 'Relatório encaminhado via e-mail.',
				title: 'Relatório Gerado',
				label: 'OK'
			}, function (el, ev) {
				parent.location.reload();
			});
		}),
		error: (error => {
			console.error(error);
			loading.hide();
			FLUIGC.toast({
				message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
				type: "warning"
			});
		})
	});

	//console.log(xml);
}
function GeraControleFaturamento(codccusto, usuario, email) {
	var xml =
		"<PARAM>\
			<CODCCUSTO>" + codccusto + "</CODCCUSTO>\
			<USUARIO>" + usuario + "</USUARIO>\
			<EMAIL>" + email + "</EMAIL>\
		</PARAM>";

	DatasetFactory.getDataset("ExecutaRelatorio", null, [
		DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
		DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
		DatasetFactory.createConstraint("pIdFormula", 26, 26, ConstraintType.MUST)
	], null, {
		success: (retorno => {
			console.log(retorno);
			loading.hide();
			FLUIGC.message.alert({
				message: 'Relatório encaminhado via e-mail.',
				title: 'Relatório Gerado',
				label: 'OK'
			}, function (el, ev) {
				parent.location.reload();
			});
		}),
		error: (error => {
			console.error(error);
			loading.hide();
			FLUIGC.toast({
				message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
				type: "warning"
			});
		})
	});

	//console.log(xml);
}
function GeraCustoMaoDeObra(codccusto, usuario, email) {
	var xml =
		"<PARAM>\
			<CODCCUSTO>" + codccusto + "</CODCCUSTO>\
			<USUARIO>" + usuario + "</USUARIO>\
			<EMAIL>" + email + "</EMAIL>\
		</PARAM>";

	DatasetFactory.getDataset("ExecutaRelatorio", null, [
		DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
		DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
		DatasetFactory.createConstraint("pIdFormula", 29, 29, ConstraintType.MUST)
	], null, {
		success: (retorno => {
			console.log(retorno);
			loading.hide();
			FLUIGC.message.alert({
				message: 'Relatório encaminhado via e-mail.',
				title: 'Relatório Gerado',
				label: 'OK'
			}, function (el, ev) {
				parent.location.reload();
			});
		}),
		error: (error => {
			console.error(error);
			loading.hide();
			FLUIGC.toast({
				message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
				type: "warning"
			});
		})
	});

	//console.log(xml);
}
function GeraCompromissosGerenciais(codccusto, usuario, email) {
	var xml =
		"<PARAM>\
			<CODCCUSTO>" + codccusto + "</CODCCUSTO>\
			<USUARIO>" + usuario + "</USUARIO>\
			<EMAIL>" + email + "</EMAIL>\
		</PARAM>";

	DatasetFactory.getDataset("ExecutaRelatorio", null, [
		DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
		DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
		DatasetFactory.createConstraint("pIdFormula", 30, 30, ConstraintType.MUST)
	], null, {
		success: (retorno => {
			console.log(retorno);
			loading.hide();
			FLUIGC.message.alert({
				message: 'Relatório encaminhado via e-mail.',
				title: 'Relatório Gerado',
				label: 'OK'
			}, function (el, ev) {
				parent.location.reload();
			});
		}),
		error: (error => {
			console.error(error);
			loading.hide();
			FLUIGC.toast({
				message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
				type: "warning"
			});
		})
	});

	//console.log(xml);
}
function GeraOrdensPendentes(codccusto, usuario, email) {
	var xml =
		"<PARAM>\
			<CODCCUSTO>" + codccusto + "</CODCCUSTO>\
			<USUARIO>" + usuario + "</USUARIO>\
			<EMAIL>" + email + "</EMAIL>\
		</PARAM>";

	DatasetFactory.getDataset("ExecutaRelatorio", null, [
		DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
		DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
		DatasetFactory.createConstraint("pIdFormula", 34, 34, ConstraintType.MUST)
	], null, {
		success: (retorno => {
			console.log(retorno);
			loading.hide();
			FLUIGC.message.alert({
				message: 'Relatório encaminhado via e-mail.',
				title: 'Relatório Gerado',
				label: 'OK'
			}, function (el, ev) {
				parent.location.reload();
			});
		}),
		error: (error => {
			console.error(error);
			loading.hide();
			FLUIGC.toast({
				message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
				type: "warning"
			});
		})
	});

	//console.log(xml);
}
function GeraCompromissosCadastrados(opcao) {
	var dtInicio = $("#dataInicioCompromissosCadastrados").val();
	var dtFim = $("#dataFimCompromissosCadastrados").val();

	if (dtInicio == "" || dtInicio == null) {
		FLUIGC.toast({
			message: "Data início não preenchida!",
			type: "warning"
		});
		loading.hide();
	}
	else if (dtFim == "" || dtFim == null) {
		FLUIGC.toast({
			message: "Data fim não preenchida!",
			type: "warning"
		});
		loading.hide();
	}
	else {
		DatasetFactory.getDataset("colleague", ["mail"], [
			DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST)
		], null, {
			success: (ds => {
				var user = WCMAPI.userCode;
				if (user == "alysson.silva1") {
					user = "alysson.silva";
				} else if (user == "ademir.rodrigues") {
					user = "ademir";
				} else if (user == "fernando.jarvorski") {
					user = "fernandoj";
				} else if (user == "fernando.almeida") {
					user = "fernandoa";
				}

				var mail = ds.values[0].mail;
				var DATAINI = $("#dataInicioCompromissosCadastrados").val().split("/");
				DATAINI = DATAINI[2] + "-" + DATAINI[1] + "-" + DATAINI[0];
				var DATAFIM = $("#dataFimCompromissosCadastrados").val().split("/");
				DATAFIM = DATAFIM[2] + "-" + DATAFIM[1] + "-" + DATAFIM[0];

				if (DATAINI > DATAFIM) {
					FLUIGC.toast({
						message: "A data inicial não deve ser maior que a data final.",
						type: "warning"
					});
					loading.hide();
				} else {
					var xml =
						"<PARAM>\
						<DATAINI>" + DATAINI + "</DATAINI>\
						<DATAFIM>" + DATAFIM + "</DATAFIM>\
						<USUARIO>" + user + "</USUARIO>\
						<EMAIL>" + mail + "</EMAIL>\
					</PARAM>";

					var idFormulaVisual = null;
					if (opcao == 1) {
						// Compromissos Cadastrados
						idFormulaVisual = 22;
					} else if (opcao == 2) {
						// Compromissos Cadastrados (FFCX/RDV/RDO)
						idFormulaVisual = 27;
					}

					DatasetFactory.getDataset("ExecutaRelatorio", null, [
						DatasetFactory.createConstraint("pXML", xml, xml, ConstraintType.MUST),
						DatasetFactory.createConstraint("pCodColigada", 1, 1, ConstraintType.MUST),
						DatasetFactory.createConstraint("pIdFormula", idFormulaVisual, idFormulaVisual, ConstraintType.MUST)
					], null, {
						success: (retorno => {
							console.log(retorno);
							loading.hide();
							FLUIGC.message.alert({
								message: 'Relatório encaminhado via e-mail.',
								title: 'Relatório Gerado',
								label: 'OK'
							}, function (el, ev) {
								parent.location.reload();
							});

							/*FLUIGC.toast({
								message: "Relatório encaminhado via e-mail para " + mail + ".",
								type: "success"
							});*/
						}),
						error: (error => {
							console.error(error);
							loading.hide();
							FLUIGC.toast({
								message: "Erro ao gerar relatório, favor entrar em contato com o administrador do sistema.",
								type: "warning"
							});
						})
					})

					//console.log(xml);
				}
			}),
			error: (error) => {
				console.error(error);
				FLUIGC.toast({
					message: "Erro ao buscar e-mail do usuário, favor entrar em contato com o administrador do sistema.",
					type: "warning"
				});
				loading.hide();
			}
		})
	}
}


// Utils
function validateEmail(email) {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};
function VerificaSeUsuarioPertenceAosGrupos(user, groupList) {
	return new Promise((resolve, reject) => {
		var constraints = [DatasetFactory.createConstraint("colleagueId", user, user, ConstraintType.MUST)];
		for (const grupo of groupList) {
			constraints.push(DatasetFactory.createConstraint("groupId", grupo, grupo, ConstraintType.SHOULD, true));
		}		
		
		DatasetFactory.getDataset("colleagueGroup", null, constraints, null, {
			success: (ds) => {
				if (ds.values.length > 0) {
					resolve(ds.values);
				}
				else {
					resolve(false);
				}
			}
		});
	});
}
function BuscaEmailUsuario() {
	return new Promise((resolve, reject) => {
		DatasetFactory.getDataset("colleague", ["mail"], [
			DatasetFactory.createConstraint("colleagueId", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST)
		], null, {
			success: (ds => {
				resolve(ds.values[0].mail);
				$("#emailCompromissosCadastrados").val(ds.values[0].mail);
			}),
			error: (error => {
				FLUIGC.toast({
					title: "Erro ao buscar e-mail do usuário: ",
					message: error,
					type: "warning"
				});
				reject();
			})
		})
	})
}
async function BuscaAPI(URL, metodo) {
	fetch(URL, {
		method: metodo,
		headers: {
			'Content-type': 'application/json',
			"Authorization": "Basic Zmx1aWc6Zmx1IWdAY2MjMjAxOA=="
		}
	}).then(response => {
		console.log(response);
		if (response.status == 200) {
			setTimeout(() => {
				loading.hide();
				FLUIGC.toast({
					message: "Relatório gerado, aguarde o recebimento por e-mail!",
					type: "success"
				});
			}, 10000);

		} else {
			setTimeout(() => {
				loading.hide();
				FLUIGC.toast({
					message: "Não foi possível gerar o relatório. Por favor entre em contato com o departamento de TI!",
					type: "warning"
				});
			}, 2000);
		}
	}).catch(error => {
		console.error(error);
		setTimeout(() => {
			loading.hide();
			FLUIGC.toast({
				message: "Não foi possível gerar o relatório. Por favor entre em contato com o departamento de TI!",
				type: "warning"
			});
		}, 2000);
	});
}
function BuscaObras() {
	DatasetFactory.getDataset("BuscaPermissaoColigadasUsuario", null, [
		DatasetFactory.createConstraint("usuario", WCMAPI.userCode, WCMAPI.userCode, ConstraintType.MUST)
	], null, {
		success: (ds => {
			$("#selectCCUSTO").html("<option></option>");
			ds.values.forEach(ccusto => {
				if (ccusto.CODCOLIGADA == 1) {
					$("#selectCCUSTO").append("<option value='" + ccusto.CODCCUSTO + "'>" + ccusto.CODCCUSTO + " - " + ccusto.perfil + "</option>");
				}
			});
			$("#selectCCUSTO").append("<option value='Todos'>Todos os Centros de Custo</option>");
		})
	});
}
function IniciaCamposDeData() {
	$("#dataInicioCompromissosCadastrados").val(moment().startOf('month').format("DD/MM/YYYY"));
	$("#dataFimCompromissosCadastrados").val(moment().endOf('month').format("DD/MM/YYYY"));
	FLUIGC.calendar("#dataInicioCompromissosCadastrados");
	FLUIGC.calendar("#dataFimCompromissosCadastrados");
}